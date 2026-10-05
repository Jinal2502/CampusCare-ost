# CampusCare — Student Wellness & Productivity Portal

CampusCare is a semester-long college project that evolves across **10 practicals** into a full **Student Wellness & Productivity Portal**. The goal is to build a clean, maintainable foundation first, then incrementally expand features (UI, forms, data handling, authentication, dashboards, etc.) throughout the semester.

This repository is intentionally structured like a real project: consistent design language, readable code, and documentation that grows with each practical.

## Project goals

- **Wellness**: support healthy routines, stress management, and access to resources.
- **Productivity**: help students plan study sessions realistically and build sustainable habits.
- **Professional UI**: modern, minimal, spacious design—no heavy frameworks for Practical 1.
- **Maintainability**: predictable folder structure + reusable CSS patterns that can scale.

## Technology stack (current)

- **Django 5** (project + app, templates, forms, URL routing)
- **HTML5** (semantic structure, now served as Django templates)
- **CSS3** (Flexbox, Grid, responsive design, transitions)
- **JavaScript** (Pomodoro timer, Check-In UI)
- **jQuery** (home-page Today's routine board — Practical 7 DOM operations)
- **Google Fonts**: Inter

> Practical 5 introduces **Django** as the web framework while preserving the existing CampusCare UI.

## Folder structure

```text
CampusCare/
├── manage.py
├── requirements.txt
├── campuscare/              # Django project
├── core/                    # Django app (views, forms, templates)
├── static/                  # CSS, JS, analytics, data (Django static files)
├── index.html               # Original static pages (kept for earlier practicals)
├── pomodoro.html
├── checkin.html
├── css/                     # Original stylesheets (mirrored in static/css)
├── js/
├── README.md
├── docs/
│   ├── practical1.md
│   ├── practical4.md
│   └── practical5.md
└── ...
```

### What each folder is for

- **`manage.py`**: Django entry point (`runserver`, migrations, etc.).
- **`core/`**: app with views, the contact form, and Django templates.
- **`static/`**: CSS, JavaScript, analytics assets, and dataset files served by Django.
- **`docs/`**: documentation for each practical (one file per practical).
- Root `*.html` / `css/` / `js/`: originals from earlier practicals; Django serves the template + static versions.

## Practicals roadmap (placeholders)

- **Practical 1**: Premium landing page using HTML + CSS (grid background, responsive layout, semantic tags, and three CSS methods).  
  - Docs: `docs/practical1.md`
- **Practical 2**: _TBD_ (placeholder)
- **Practical 3**: _TBD_ (placeholder)
- **Practical 4**: Student wellness data visualization with Pandas + Matplotlib.  
  - Dataset: `data/student_wellness.csv`
  - Notebook: `analytics/student_wellness_analytics.ipynb`
  - Docs: `docs/practical4.md`
- **Practical 5**: Django project setup — convert CampusCare into a Django app with templates, static files, and a contact form.  
  - Docs: `docs/practical5.md`
- **Practical 6**: _TBD_ (placeholder)
- **Practical 7**: jQuery DOM manipulation on the home-page Today's routine board (select, text/html, classes, show/hide, append/remove, events).
- **Practical 8**: _TBD_ (placeholder)
- **Practical 9**: _TBD_ (placeholder)
- **Practical 10**: _TBD_ (placeholder)

## How to run

### Django (Practical 5 — recommended)

```bash
source .venv/bin/activate && python manage.py runserver
```

Open http://127.0.0.1:8000/

Routes: `/`, `/pomodoro/`, `/checkin/`, `/contact/`

### Static / earlier practicals

- Open `index.html` directly in a browser, **or**
- Use a simple local server:

```bash
python3 -m http.server 5500
```

Then open `http://localhost:5500` in your browser.

## Design system (Practical 1 palette)

- Background: `#FCFCFD`
- Primary: `#2563EB`
- Secondary: `#7C3AED`
- Accent: `#06B6D4`
- Success: `#10B981`
- Primary Text: `#111827`
- Secondary Text: `#6B7280`
- Border: `#E5E7EB`

## Notes for future practicals

- Keep components semantic and reusable.
- Prefer external CSS for scalability; use internal/inline only when required by a practical.
- Keep assets organized by type (`images/`, `icons/`).
