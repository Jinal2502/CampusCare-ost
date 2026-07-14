# CampusCare — Student Wellness & Productivity Portal

CampusCare is a semester-long college project that evolves across **10 practicals** into a full **Student Wellness & Productivity Portal**. The goal is to build a clean, maintainable foundation first, then incrementally expand features (UI, forms, data handling, authentication, dashboards, etc.) throughout the semester.

This repository is intentionally structured like a real project: consistent design language, readable code, and documentation that grows with each practical.

## Project goals

- **Wellness**: support healthy routines, stress management, and access to resources.
- **Productivity**: help students plan study sessions realistically and build sustainable habits.
- **Professional UI**: modern, minimal, spacious design—no heavy frameworks for Practical 1.
- **Maintainability**: predictable folder structure + reusable CSS patterns that can scale.

## Technology stack (current)

- **HTML5** (semantic structure)
- **CSS3** (Flexbox, Grid, responsive design, transitions)
- **Google Fonts**: Inter

> Note: Practical 1 uses **only HTML and CSS** as required. Future practicals may introduce JavaScript and additional technologies based on syllabus needs.

## Folder structure

```text
CampusCare/
├── index.html
├── README.md
├── css/
│   └── style.css
├── assets/
│   ├── images/
│   └── icons/
└── docs/
    └── practical1.md
```

### What each folder is for

- **`index.html`**: main landing page for the portal (Practical 1).
- **`css/style.css`**: external stylesheet (most styling lives here).
- **`assets/`**: project assets.
  - **`assets/images/`**: images used by the project (kept empty for now).
  - **`assets/icons/`**: icons used by the project (kept empty for now).
- **`docs/`**: documentation for each practical (one file per practical).

## Practicals roadmap (placeholders)

- **Practical 1**: Premium landing page using HTML + CSS (grid background, responsive layout, semantic tags, and three CSS methods).  
  - Docs: `docs/practical1.md`
- **Practical 2**: _TBD_ (placeholder)
- **Practical 3**: _TBD_ (placeholder)
- **Practical 4**: _TBD_ (placeholder)
- **Practical 5**: _TBD_ (placeholder)
- **Practical 6**: _TBD_ (placeholder)
- **Practical 7**: _TBD_ (placeholder)
- **Practical 8**: _TBD_ (placeholder)
- **Practical 9**: _TBD_ (placeholder)
- **Practical 10**: _TBD_ (placeholder)

## How to run

This is a static website for Practical 1.

- Open `index.html` directly in a browser, **or**
- Use a simple local server (recommended) to avoid path issues:

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

