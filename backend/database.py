"""SQLite helpers for the Student Portal (Practical 9).

The students table in database/students.db is the source of truth.
The Flask API in backend/app.py calls these functions.
"""

import re
import sqlite3
from pathlib import Path

# Project root is the parent of the backend/ folder.
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "students.db"

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

# A few records so READ, UPDATE, and DELETE can be shown immediately.
SAMPLE_STUDENTS = [
    ("Aarav Shah", "aarav.shah@campuscare.local", "Computer Science", 4, 92, 86),
    ("Meera Patel", "meera.patel@campuscare.local", "Information Technology", 6, 88, 91),
    ("Rohan Desai", "rohan.desai@campuscare.local", "Electronics", 3, 76, 74),
    ("Ananya Iyer", "ananya.iyer@campuscare.local", "Computer Science", 5, 95, 89),
]


class ValidationError(Exception):
    """Raised when the form data cannot be stored."""


class NotFoundError(Exception):
    """Raised when no student exists for the given id."""


def get_connection():
    """Open the SQLite file and return rows as dictionaries."""
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    """Create the database file and students table if they do not exist."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    with get_connection() as connection:
        # CREATE: the table itself, only when it is missing.
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                department TEXT NOT NULL,
                semester INTEGER NOT NULL,
                attendance REAL NOT NULL,
                marks REAL NOT NULL
            )
            """
        )

        count = connection.execute("SELECT COUNT(*) FROM students").fetchone()[0]
        if count == 0:
            connection.executemany(
                """
                INSERT INTO students (name, email, department, semester, attendance, marks)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                SAMPLE_STUDENTS,
            )


def _row_to_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "department": row["department"],
        "semester": row["semester"],
        "attendance": row["attendance"],
        "marks": row["marks"],
    }


def _require_text(data, field, label):
    value = data.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{label} is required.")
    return value.strip()


def _require_number(data, field, label, minimum, maximum):
    value = data.get(field)
    if isinstance(value, bool) or value is None or value == "":
        raise ValidationError(f"{label} is required.")
    try:
        number = float(value)
    except (TypeError, ValueError):
        raise ValidationError(f"{label} must be a number.")
    if number < minimum or number > maximum:
        raise ValidationError(f"{label} must be between {minimum} and {maximum}.")
    return number


def _validate_student(data):
    """Check required fields before any INSERT or UPDATE."""
    if not isinstance(data, dict):
        raise ValidationError("Student details must be sent as JSON.")

    name = _require_text(data, "name", "Name")
    email = _require_text(data, "email", "Email").lower()
    department = _require_text(data, "department", "Department")

    if not EMAIL_RE.match(email):
        raise ValidationError("Email must be a valid email address.")
    if len(name) > 120 or len(department) > 80:
        raise ValidationError("Name or department is too long.")

    semester = _require_number(data, "semester", "Semester", 1, 8)
    if semester != int(semester):
        raise ValidationError("Semester must be a whole number from 1 to 8.")

    attendance = _require_number(data, "attendance", "Attendance", 0, 100)
    marks = _require_number(data, "marks", "Marks", 0, 100)

    return (name, email, department, int(semester), attendance, marks)


def get_students():
    """READ: return every student, oldest id first."""
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM students ORDER BY id"
        ).fetchall()
    return [_row_to_dict(row) for row in rows]


def get_student(student_id):
    """READ one student. Used by UPDATE so the form can be checked."""
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM students WHERE id = ?",
            (student_id,),
        ).fetchone()
    if row is None:
        raise NotFoundError("Student not found.")
    return _row_to_dict(row)


def add_student(data):
    """CREATE: insert one student and return the saved row."""
    values = _validate_student(data)
    try:
        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO students (name, email, department, semester, attendance, marks)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                values,
            )
            row = connection.execute(
                "SELECT * FROM students WHERE id = ?",
                (cursor.lastrowid,),
            ).fetchone()
    except sqlite3.IntegrityError:
        raise ValidationError("A student with this email already exists.")
    return _row_to_dict(row)


def update_student(student_id, data):
    """UPDATE: change one existing student and return the saved row."""
    if student_id < 1:
        raise NotFoundError("Student not found.")

    values = _validate_student(data)
    try:
        with get_connection() as connection:
            cursor = connection.execute(
                """
                UPDATE students
                SET name = ?, email = ?, department = ?, semester = ?, attendance = ?, marks = ?
                WHERE id = ?
                """,
                (*values, student_id),
            )
            if cursor.rowcount == 0:
                raise NotFoundError("Student not found.")
            row = connection.execute(
                "SELECT * FROM students WHERE id = ?",
                (student_id,),
            ).fetchone()
    except sqlite3.IntegrityError:
        raise ValidationError("A student with this email already exists.")
    return _row_to_dict(row)


def delete_student(student_id):
    """DELETE: remove one student by primary key."""
    if student_id < 1:
        raise NotFoundError("Student not found.")

    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM students WHERE id = ?",
            (student_id,),
        )
        if cursor.rowcount == 0:
            raise NotFoundError("Student not found.")
    return student_id
