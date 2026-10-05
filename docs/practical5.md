# Practical 5 — Django Project Setup (CampusCare)

## Goal

Set up a Django project and convert the existing CampusCare website into a basic Django web application, while keeping the current design and pages intact.

## What was implemented

1. Django project (`campuscare`) initialized inside the existing CampusCare repo
2. Django app (`core`) created for pages and views
3. Existing HTML pages converted to Django templates under `core/templates/core/`
4. CSS, JavaScript, analytics, and data files placed in `static/`
5. Static files configured via `STATIC_URL` and `STATICFILES_DIRS`
6. URL routes:
   - `/` — Home
   - `/pomodoro/` — Pomodoro Timer
   - `/checkin/` — Wellness Check-In (existing page preserved)
   - `/contact/` — Django contact form (POST + success message)
7. Contact form handled with a Django `Form` (no database model required)

## How to run (one command)

From the project root:

```bash
source .venv/bin/activate && python manage.py runserver
```

Then open:

- http://127.0.0.1:8000/
- http://127.0.0.1:8000/pomodoro/
- http://127.0.0.1:8000/contact/

## Project structure (Django pieces)

```text
CampusCare/
├── manage.py
├── requirements.txt
├── campuscare/          # Django project settings + root URLs
├── core/                # Django app
│   ├── forms.py         # ContactForm
│   ├── views.py
│   ├── urls.py
│   └── templates/core/  # Django templates
└── static/              # CSS, JS, analytics, data
```

## Notes

- Visual design matches previous practicals (same CSS and layout).
- Pomodoro timer JavaScript continues to work as a client-side feature.
- Check-In UI is served by Django; its PostgreSQL API still comes from the earlier Node/Express server if you need live saves.
- Contact form demonstrates Django POST handling and messages framework without models.
