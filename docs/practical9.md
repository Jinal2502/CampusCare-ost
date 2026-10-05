# Practical 9: SQLite CRUD for Student Records

Practical 9 adds a Student Portal to the existing CampusCare site. Django serves the page. Student rows are stored in SQLite through Python’s `sqlite3` module (`backend/database.py`).

```text
Landing page  →  Login / Sign Up  →  /student-portal/
        ↓
Frontend fetch() to /students
        ↓
Django (or optional Flask on port 5001)
        ↓
backend/database.py  (sqlite3)
        ↓
database/students.db
```

The wellness check-in API (`/api/students`) is a different feature. Practical 9 does not use it.

## Files

- `backend/database.py` — `init_db()`, `get_students()`, `add_student()`, `update_student()`, `delete_student()`
- `backend/app.py` — Flask routes for the four operations
- `database/students.db` — created automatically the first time the API starts
- `core/templates/core/student_portal.html` — dashboard, table, add/edit form, delete confirmation
- `static/js/portal.js` — calls the Flask API and refreshes the table
- `static/css/portal.css` — portal layout, using the existing CampusCare colors
- `core/templates/core/index.html` — Login / Sign Up button and demo sign-in dialog

## Database

Table: `students`

| Column | Type |
| --- | --- |
| id | INTEGER PRIMARY KEY |
| name | TEXT |
| email | TEXT, unique |
| department | TEXT |
| semester | INTEGER (1–8) |
| attendance | REAL (0–100) |
| marks | REAL (0–100) |

If the table is empty at startup, four sample students are inserted so READ, UPDATE, and DELETE can be shown immediately.

Queries use `?` placeholders. Example:

```python
cursor.execute(
    "INSERT INTO students (name, email, department, semester, attendance, marks) VALUES (?, ?, ?, ?, ?, ?)",
    values,
)
```

## API

| Method | Path | SQL |
| --- | --- | --- |
| GET | `/students` | `SELECT * FROM students` |
| POST | `/students` | `INSERT INTO students ...` |
| PUT | `/students/<id>` | `UPDATE students SET ... WHERE id = ?` |
| DELETE | `/students/<id>` | `DELETE FROM students WHERE id = ?` |

The API returns JSON. Validation errors use HTTP 400. A missing id uses HTTP 404.

## Demo sign-in

Login / Sign Up on the home page is only a demonstration. Any name, email, and password (at least 4 characters) opens `/student-portal/`. The password is not saved. The name is kept in `sessionStorage` so the portal can show who signed in. Student rows are not stored in the browser.

## How to run

The table is loaded from `/students` on the same Django server (`python manage.py runserver`). Flask (`python3 backend/app.py`) is optional and uses the same SQLite file.

To inspect the database while the API is stopped, or in another terminal:

```bash
sqlite3 database/students.db "SELECT * FROM students;"
```

## What to demonstrate

1. Open the landing page and point to **Login / Sign Up**.
2. Enter any name, email, and password, then continue.
3. Show the sample rows already loaded from SQLite.
4. Click **Add Student**, submit a new row, and show it in the table.
5. Click **Edit**, change marks, save, and show the new value.
6. Click **Delete**, confirm, and show that the row is gone.
7. Refresh the page. The remaining rows are still there.
8. Optionally run the `sqlite3` command above and show the same rows.
