# Generated manually for ContactMessage + drop legacy Node tables

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ContactMessage",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("email", models.EmailField(max_length=254)),
                ("message", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
              IF EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'students'
              ) THEN
                INSERT INTO core_student (full_name, email, course, year, created_at)
                SELECT full_name, email, course, year, created_at
                FROM students s
                WHERE NOT EXISTS (
                  SELECT 1 FROM core_student cs WHERE lower(cs.email) = lower(s.email)
                );
              END IF;

              IF EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'wellness_checkins'
              ) AND EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'students'
              ) THEN
                INSERT INTO core_wellnesscheckin
                  (student_id, checkin_date, mood, energy, stress, note, created_at)
                SELECT cs.id, w.checkin_date, w.mood, w.energy, w.stress, w.note, w.created_at
                FROM wellness_checkins w
                JOIN students s ON s.id = w.student_id
                JOIN core_student cs ON lower(cs.email) = lower(s.email)
                WHERE NOT EXISTS (
                  SELECT 1 FROM core_wellnesscheckin cw
                  WHERE cw.student_id = cs.id AND cw.checkin_date = w.checkin_date
                );
              END IF;

              DROP TABLE IF EXISTS wellness_checkins CASCADE;
              DROP TABLE IF EXISTS students CASCADE;
            END $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
