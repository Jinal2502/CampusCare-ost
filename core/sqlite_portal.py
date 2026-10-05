"""Student Portal CRUD using Python sqlite3 (database/students.db).

These Django routes match the Flask API in backend/app.py and call the
same functions in backend/database.py. The UI talks to this same-origin
API so it works as soon as `python manage.py runserver` is running.
"""

import json
import sqlite3
import sys

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

if str(settings.BASE_DIR) not in sys.path:
    sys.path.insert(0, str(settings.BASE_DIR))

from backend.database import (
    NotFoundError,
    ValidationError,
    add_student,
    delete_student,
    get_students,
    init_db,
    update_student,
)


def _error(message, status):
    return JsonResponse({"error": message}, status=status)


def _read_json(request):
    if not request.body:
        return {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else {}


@csrf_exempt
@require_http_methods(["GET", "POST"])
def students_collection(request):
    """GET = READ all students. POST = CREATE one student."""
    try:
        init_db()
        if request.method == "GET":
            return JsonResponse({"students": get_students()})

        data = _read_json(request)
        if data is None:
            return _error("Invalid JSON.", 400)
        student = add_student(data)
        return JsonResponse({"student": student, "message": "Student added."}, status=201)
    except ValidationError as exc:
        return _error(str(exc), 400)
    except sqlite3.Error:
        return _error("The database could not complete this request.", 500)


@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def students_item(request, student_id):
    """PUT = UPDATE. DELETE = DELETE."""
    try:
        init_db()
        if request.method == "PUT":
            data = _read_json(request)
            if data is None:
                return _error("Invalid JSON.", 400)
            student = update_student(student_id, data)
            return JsonResponse({"student": student, "message": "Student updated."})

        delete_student(student_id)
        return JsonResponse({"id": student_id, "message": "Student deleted."})
    except ValidationError as exc:
        return _error(str(exc), 400)
    except NotFoundError as exc:
        return _error(str(exc), 404)
    except sqlite3.Error:
        return _error("The database could not complete this request.", 500)
