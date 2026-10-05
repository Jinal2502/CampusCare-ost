from django.db import models


class Student(models.Model):
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    course = models.CharField(max_length=100, blank=True, null=True)
    year = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} <{self.email}>"


class WellnessCheckin(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="checkins"
    )
    checkin_date = models.DateField()
    mood = models.PositiveSmallIntegerField()
    energy = models.PositiveSmallIntegerField()
    stress = models.PositiveSmallIntegerField()
    note = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "checkin_date"],
                name="uniq_student_checkin_date",
            )
        ]
        ordering = ["checkin_date"]

    def __str__(self):
        return f"{self.student_id} {self.checkin_date}"


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} <{self.email}>"
