import json
import re
from calendar import monthrange
from datetime import date, datetime
from zoneinfo import ZoneInfo

from django.conf import settings
from django.contrib import messages
from django.http import FileResponse, Http404, JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from .forms import ContactForm
from .models import Student, WellnessCheckin
from .sqlite_portal import students_collection, students_item

IST = ZoneInfo("Asia/Kolkata")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def home(request):
    return render(request, "core/index.html")


def pomodoro(request):
    return render(request, "core/pomodoro.html")


@ensure_csrf_cookie
def checkin(request):
    return render(request, "core/checkin.html")


def faq(request):
    path = settings.BASE_DIR / "faq" / "index.html"
    if not path.is_file():
        raise Http404()
    return FileResponse(path.open("rb"), content_type="text/html; charset=utf-8")


def faq_asset(request, filename):
    if filename != "style.css":
        raise Http404()
    path = settings.BASE_DIR / "faq" / filename
    if not path.is_file():
        raise Http404()
    return FileResponse(path.open("rb"), content_type="text/css")


def student_portal(request):
    return render(request, "core/student_portal.html")


def contact(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(
                request,
                "Thank you! Your message was received. We'll get back to you soon.",
            )
            return redirect("contact")
    else:
        form = ContactForm()

    return render(request, "core/contact.html", {"form": form})


def _today_iso():
    return datetime.now(IST).date().isoformat()


def _current_month_key():
    return _today_iso()[:7]


def _is_valid_email(email):
    return isinstance(email, str) and bool(EMAIL_RE.match(email.strip()))


def _clamp_score(value):
    try:
        n = int(value)
    except (TypeError, ValueError):
        return None
    return n if 1 <= n <= 5 else None


def _parse_month(month):
    if not month or not re.match(r"^\d{4}-\d{2}$", str(month)):
        return None
    year, month_num = map(int, str(month).split("-"))
    if month_num < 1 or month_num > 12:
        return None
    last_day = monthrange(year, month_num)[1]
    return f"{month}-01", f"{month}-{last_day:02d}"


def _read_json(request):
    if not request.body:
        return {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else {}


def _json_error(message, status):
    return JsonResponse({"error": message}, status=status)


def _serialize_student(student):
    return {
        "id": student.id,
        "full_name": student.full_name,
        "email": student.email,
        "course": student.course,
        "year": student.year,
        "created_at": student.created_at.isoformat() if student.created_at else None,
    }


def _serialize_checkin(row):
    return {
        "id": row.id,
        "student_id": row.student_id,
        "checkin_date": row.checkin_date.isoformat(),
        "mood": row.mood,
        "energy": row.energy,
        "stress": row.stress,
        "note": row.note,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


def _stats_from_rows(rows):
    count = len(rows)
    if count == 0:
        return {"count": 0, "avg_stress": None, "latest_mood": None}
    avg = round(sum(r.stress for r in rows) / count, 1)
    return {
        "count": count,
        "avg_stress": avg,
        "latest_mood": rows[-1].mood,
    }


def _month_payload(student_id, month):
    range_ = _parse_month(month)
    if not range_:
        return None
    start, end = range_
    rows = list(
        WellnessCheckin.objects.filter(
            student_id=student_id,
            checkin_date__gte=start,
            checkin_date__lte=end,
        ).order_by("checkin_date")
    )
    checkins = [_serialize_checkin(row) for row in rows]
    today = _today_iso()
    today_row = next((c for c in checkins if c["checkin_date"] == today), None)
    return {
        "month": month,
        "checkins": checkins,
        "stats": _stats_from_rows(rows),
        "today": today,
        "today_checkin": today_row,
    }


def _find_student_by_email(email):
    return Student.objects.filter(email=str(email).strip().lower()).first()


def _resolve_student(student_id=None, email=None):
    if student_id not in (None, ""):
        try:
            sid = int(student_id)
        except (TypeError, ValueError):
            sid = None
        if sid and sid > 0:
            return Student.objects.filter(pk=sid).first()
    if _is_valid_email(email or ""):
        return _find_student_by_email(email)
    return None


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_students(request):
    if request.method == "GET":
        email = request.GET.get("email")
        if not _is_valid_email(email or ""):
            return _json_error("A valid email query is required.", 400)
        student = _find_student_by_email(email)
        if not student:
            return _json_error("Student not found.", 404)
        month_key = (
            request.GET.get("month")
            if _parse_month(request.GET.get("month"))
            else _current_month_key()
        )
        calendar = _month_payload(student.id, month_key)
        return JsonResponse({"student": _serialize_student(student), **calendar})

    body = _read_json(request)
    if body is None:
        return _json_error("Invalid JSON.", 400)

    full_name = (body.get("full_name") or "").strip()
    email = body.get("email")
    course = (body.get("course") or "").strip() or None
    year = (body.get("year") or "").strip() or None

    if not full_name:
        return _json_error("Full name is required.", 400)
    if not _is_valid_email(email or ""):
        return _json_error("A valid email is required.", 400)

    normalized_email = email.strip().lower()
    student = _find_student_by_email(normalized_email)
    month_key = (
        body.get("month") if _parse_month(body.get("month")) else _current_month_key()
    )

    if not student:
        student = Student.objects.create(
            full_name=full_name,
            email=normalized_email,
            course=course,
            year=year,
        )
        return JsonResponse(
            {
                "student": _serialize_student(student),
                "created": True,
                "month": month_key,
                "checkins": [],
                "stats": {"count": 0, "avg_stress": None, "latest_mood": None},
                "today": _today_iso(),
                "today_checkin": None,
            },
            status=201,
        )

    student.full_name = full_name
    if course is not None:
        student.course = course
    if year is not None:
        student.year = year
    student.save()
    calendar = _month_payload(student.id, month_key)
    return JsonResponse(
        {"student": _serialize_student(student), "created": False, **calendar}
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_checkins(request):
    if request.method == "GET":
        month = request.GET.get("month")
        if not _parse_month(month):
            return _json_error("month must be YYYY-MM.", 400)
        student = _resolve_student(
            request.GET.get("student_id"), request.GET.get("email")
        )
        if not student:
            return _json_error("Student not found.", 404)
        calendar = _month_payload(student.id, month)
        return JsonResponse(
            {
                "student": {
                    "id": student.id,
                    "full_name": student.full_name,
                    "email": student.email,
                },
                **calendar,
            }
        )

    body = _read_json(request)
    if body is None:
        return _json_error("Invalid JSON.", 400)

    mood_n = _clamp_score(body.get("mood"))
    energy_n = _clamp_score(body.get("energy"))
    stress_n = _clamp_score(body.get("stress"))
    if mood_n is None or energy_n is None or stress_n is None:
        return _json_error("Mood, energy, and stress must be integers 1–5.", 400)

    student = _resolve_student(body.get("student_id"), body.get("email"))
    if not student:
        return _json_error("Student not found. Please onboard first.", 404)

    checkin_date = body.get("checkin_date")
    if not (isinstance(checkin_date, str) and re.match(r"^\d{4}-\d{2}-\d{2}$", checkin_date)):
        checkin_date = _today_iso()

    note = body.get("note")
    note = str(note).strip()[:500] if note else None

    row, _created = WellnessCheckin.objects.update_or_create(
        student=student,
        checkin_date=date.fromisoformat(checkin_date),
        defaults={
            "mood": mood_n,
            "energy": energy_n,
            "stress": stress_n,
            "note": note,
        },
    )
    checkin = _serialize_checkin(row)
    month_key = (
        body.get("month") if _parse_month(body.get("month")) else checkin_date[:7]
    )
    calendar = _month_payload(student.id, month_key)
    return JsonResponse(
        {
            "checkin": checkin,
            "student": _serialize_student(student),
            **calendar,
        },
        status=201,
    )


@require_http_methods(["GET"])
def api_checkins_today(request):
    student = _resolve_student(request.GET.get("student_id"), request.GET.get("email"))
    if not student:
        return _json_error("Student not found.", 404)
    today = _today_iso()
    row = WellnessCheckin.objects.filter(
        student=student, checkin_date=today
    ).first()
    return JsonResponse(
        {
            "student": {
                "id": student.id,
                "full_name": student.full_name,
                "email": student.email,
            },
            "checkin": _serialize_checkin(row) if row else None,
            "today": today,
        }
    )


@require_http_methods(["GET"])
def api_health(request):
    return JsonResponse({"ok": True})
