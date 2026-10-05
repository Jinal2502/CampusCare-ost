"""Flask API for Student Portal CRUD.

Run from the project folder:

    python3 backend/app.py

The site (Django) calls these routes. SQLite lives in database/students.db.
Port 5001 is used because macOS often reserves port 5000 for AirPlay.
"""

import sqlite3
import sys
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

# Allow `python3 backend/app.py` to import database.py from this folder.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from database import (
    NotFoundError,
    ValidationError,
    add_student,
    delete_student,
    get_students,
    init_db,
    update_student,
)

app = Flask(__name__)

# The Django pages run on port 8000 and call this API on port 5001.
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://127.0.0.1:8000",
                "http://localhost:8000",
                "http://127.0.0.1:5500",
                "http://localhost:5500",
            ]
        }
    },
)


def _error(message, status):
    return jsonify({"error": message}), status


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.get("/students")
def list_students():
    """READ all students."""
    try:
        return jsonify({"students": get_students()})
    except sqlite3.Error:
        return _error("The database could not be read.", 500)


@app.post("/students")
def create_student():
    """CREATE one student."""
    data = request.get_json(silent=True)
    try:
        student = add_student(data)
    except ValidationError as exc:
        return _error(str(exc), 400)
    except sqlite3.Error:
        return _error("The student could not be saved.", 500)
    return jsonify({"student": student, "message": "Student added."}), 201


@app.put("/students/<int:student_id>")
def edit_student(student_id):
    """UPDATE one student."""
    data = request.get_json(silent=True)
    try:
        student = update_student(student_id, data)
    except ValidationError as exc:
        return _error(str(exc), 400)
    except NotFoundError as exc:
        return _error(str(exc), 404)
    except sqlite3.Error:
        return _error("The student could not be updated.", 500)
    return jsonify({"student": student, "message": "Student updated."})


@app.delete("/students/<int:student_id>")
def remove_student(student_id):
    """DELETE one student."""
    try:
        delete_student(student_id)
    except NotFoundError as exc:
        return _error(str(exc), 404)
    except sqlite3.Error:
        return _error("The student could not be deleted.", 500)
    return jsonify({"id": student_id, "message": "Student deleted."})


if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5001, debug=True)
