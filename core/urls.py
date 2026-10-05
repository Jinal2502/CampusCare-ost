from django.urls import path
from django.views.generic import RedirectView

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("index.html", RedirectView.as_view(pattern_name="home", permanent=False)),
    path("pomodoro/", views.pomodoro, name="pomodoro"),
    path("pomodoro.html", RedirectView.as_view(pattern_name="pomodoro", permanent=False)),
    path("checkin/", views.checkin, name="checkin"),
    path("checkin.html", RedirectView.as_view(pattern_name="checkin", permanent=False)),
    path("contact/", views.contact, name="contact"),
    path("faq/", views.faq, name="faq"),
    path("faq/<str:filename>", views.faq_asset, name="faq_asset"),
    # No trailing slash — frontend fetch() uses /api/students and /api/checkins
    path("api/students", views.api_students, name="api_students"),
    path("api/checkins", views.api_checkins, name="api_checkins"),
    path("api/checkins/today", views.api_checkins_today, name="api_checkins_today"),
    path("api/health", views.api_health, name="api_health"),
]
