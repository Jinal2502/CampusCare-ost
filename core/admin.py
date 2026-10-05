from django.contrib import admin

from .models import ContactMessage, Student, WellnessCheckin


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "course", "year", "created_at")
    search_fields = ("full_name", "email")


@admin.register(WellnessCheckin)
class WellnessCheckinAdmin(admin.ModelAdmin):
    list_display = ("student", "checkin_date", "mood", "energy", "stress")
    list_filter = ("checkin_date",)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "created_at")
    search_fields = ("name", "email", "message")
    readonly_fields = ("created_at",)
