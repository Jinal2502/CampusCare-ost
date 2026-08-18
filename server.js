/**
 * CampusCare Practical 3 — Express API + static frontend
 * Neon PostgreSQL via DATABASE_URL
 */
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  min: 1,
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 8000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function clampScore(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

function todayISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function dateToISO(value) {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function mapCheckin(row) {
  return {
    ...row,
    checkin_date: dateToISO(row.checkin_date),
  };
}

function parseMonth(month) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return null;
  const [y, m] = month.split("-").map(Number);
  if (m < 1 || m > 12) return null;
  const start = `${month}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

function currentMonthKey() {
  return todayISO().slice(0, 7);
}

async function findStudentByEmail(client, email) {
  const result = await client.query(
    `SELECT id, full_name, email, course, year, created_at
     FROM students WHERE email = $1`,
    [String(email).trim().toLowerCase()]
  );
  return result.rows[0] || null;
}

async function findStudentById(client, id) {
  const result = await client.query(
    `SELECT id, full_name, email, course, year, created_at
     FROM students WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

function statsFromRows(rows) {
  const count = rows.length;
  const avgStress =
    count === 0
      ? null
      : Math.round((rows.reduce((sum, r) => sum + r.stress, 0) / count) * 10) / 10;
  const latest = count === 0 ? null : rows[rows.length - 1];
  return {
    count,
    avg_stress: avgStress,
    latest_mood: latest ? latest.mood : null,
  };
}

async function monthPayload(client, studentId, month) {
  const range = parseMonth(month);
  if (!range) return null;

  const result = await client.query(
    `SELECT id, to_char(checkin_date, 'YYYY-MM-DD') AS checkin_date,
            mood, energy, stress, note, created_at
     FROM wellness_checkins
     WHERE student_id = $1
       AND checkin_date >= $2::date
       AND checkin_date <= $3::date
     ORDER BY checkin_date ASC`,
    [studentId, range.start, range.end]
  );

  const checkins = result.rows.map(mapCheckin);
  const today = todayISO();
  const todayRow = checkins.find((row) => row.checkin_date === today) || null;

  return {
    month,
    checkins,
    stats: statsFromRows(checkins),
    today,
    today_checkin: todayRow,
  };
}

async function resolveStudent(client, { student_id, email }) {
  if (student_id) {
    const id = Number(student_id);
    if (Number.isInteger(id) && id > 0) {
      return findStudentById(client, id);
    }
  }
  if (isValidEmail(email)) {
    return findStudentByEmail(client, email);
  }
  return null;
}

/** Onboard (or return existing) + month calendar in one round trip */
app.post("/api/students", async (req, res) => {
  const client = await pool.connect();
  try {
    const { full_name, email, course, year, month } = req.body || {};

    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let student = await findStudentByEmail(client, normalizedEmail);
    let created = false;

    if (!student) {
      const insert = await client.query(
        `INSERT INTO students (full_name, email, course, year)
         VALUES ($1, $2, $3, $4)
         RETURNING id, full_name, email, course, year, created_at`,
        [
          String(full_name).trim(),
          normalizedEmail,
          course ? String(course).trim() : null,
          year ? String(year).trim() : null,
        ]
      );
      student = insert.rows[0];
      created = true;
      return res.status(201).json({
        student,
        created,
        month: parseMonth(month) ? month : currentMonthKey(),
        checkins: [],
        stats: { count: 0, avg_stress: null, latest_mood: null },
        today: todayISO(),
        today_checkin: null,
      });
    }

    const monthKey = parseMonth(month) ? month : currentMonthKey();
    const calendar = await monthPayload(client, student.id, monthKey);

    return res.status(200).json({ student, created, ...calendar });
  } catch (err) {
    console.error("POST /api/students", err);
    return res.status(500).json({ error: "Could not save student." });
  } finally {
    client.release();
  }
});

/** Lookup student + month calendar in one round trip */
app.get("/api/students", async (req, res) => {
  const client = await pool.connect();
  try {
    const email = req.query.email;
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email query is required." });
    }
    const student = await findStudentByEmail(client, email);
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const monthKey = parseMonth(req.query.month) ? req.query.month : currentMonthKey();
    const calendar = await monthPayload(client, student.id, monthKey);
    return res.json({ student, ...calendar });
  } catch (err) {
    console.error("GET /api/students", err);
    return res.status(500).json({ error: "Could not load student." });
  } finally {
    client.release();
  }
});

/** Upsert today's check-in and return the same month payload */
app.post("/api/checkins", async (req, res) => {
  const client = await pool.connect();
  try {
    const { student_id, email, mood, energy, stress, note, checkin_date } = req.body || {};

    const moodN = clampScore(mood);
    const energyN = clampScore(energy);
    const stressN = clampScore(stress);
    if (moodN === null || energyN === null || stressN === null) {
      return res.status(400).json({ error: "Mood, energy, and stress must be integers 1–5." });
    }

    let studentId = Number(student_id);
    let student = null;

    if (Number.isInteger(studentId) && studentId > 0) {
      // Skip extra lookup — insert by id (FK will fail if invalid)
    } else {
      student = await resolveStudent(client, { student_id, email });
      if (!student) {
        return res.status(404).json({ error: "Student not found. Please onboard first." });
      }
      studentId = student.id;
    }

    const date = checkin_date && /^\d{4}-\d{2}-\d{2}$/.test(checkin_date)
      ? checkin_date
      : todayISO();

    let result;
    try {
      result = await client.query(
      `INSERT INTO wellness_checkins
         (student_id, checkin_date, mood, energy, stress, note)
       VALUES ($1, $2::date, $3, $4, $5, $6)
       ON CONFLICT (student_id, checkin_date)
       DO UPDATE SET
         mood = EXCLUDED.mood,
         energy = EXCLUDED.energy,
         stress = EXCLUDED.stress,
         note = EXCLUDED.note,
         created_at = NOW()
       RETURNING id, student_id, to_char(checkin_date, 'YYYY-MM-DD') AS checkin_date,
                 mood, energy, stress, note, created_at`,
      [
        studentId,
        date,
        moodN,
        energyN,
        stressN,
        note ? String(note).trim().slice(0, 500) : null,
      ]
      );
    } catch (err) {
      if (err.code === "23503") {
        return res.status(404).json({ error: "Student not found. Please onboard first." });
      }
      throw err;
    }

    const checkin = mapCheckin(result.rows[0]);
    return res.status(201).json({
      checkin,
      student: student || { id: studentId },
    });
  } catch (err) {
    console.error("POST /api/checkins", err);
    return res.status(500).json({ error: "Could not save check-in." });
  } finally {
    client.release();
  }
});

/** Month check-ins + stats for calendar */
app.get("/api/checkins", async (req, res) => {
  const client = await pool.connect();
  try {
    const month = req.query.month;
    const range = parseMonth(month);
    if (!range) {
      return res.status(400).json({ error: "month must be YYYY-MM." });
    }

    const student = await resolveStudent(client, {
      student_id: req.query.student_id,
      email: req.query.email,
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const calendar = await monthPayload(client, student.id, month);
    return res.json({
      student: { id: student.id, full_name: student.full_name, email: student.email },
      ...calendar,
    });
  } catch (err) {
    console.error("GET /api/checkins", err);
    return res.status(500).json({ error: "Could not load check-ins." });
  } finally {
    client.release();
  }
});

app.get("/api/checkins/today", async (req, res) => {
  const client = await pool.connect();
  try {
    const student = await resolveStudent(client, {
      student_id: req.query.student_id,
      email: req.query.email,
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const today = todayISO();
    const result = await client.query(
      `SELECT id, to_char(checkin_date, 'YYYY-MM-DD') AS checkin_date,
              mood, energy, stress, note, created_at
       FROM wellness_checkins
       WHERE student_id = $1 AND checkin_date = $2::date`,
      [student.id, today]
    );

    return res.json({
      student: { id: student.id, full_name: student.full_name, email: student.email },
      checkin: result.rows[0] ? mapCheckin(result.rows[0]) : null,
      today,
    });
  } catch (err) {
    console.error("GET /api/checkins/today", err);
    return res.status(500).json({ error: "Could not load today's check-in." });
  } finally {
    client.release();
  }
});

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

async function keepNeonWarm() {
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    console.error("Neon keep-alive failed:", err.message);
  }
}

keepNeonWarm();
setInterval(keepNeonWarm, 2 * 60 * 1000).unref();

app.listen(PORT, () => {
  console.log(`CampusCare running at http://localhost:${PORT}`);
  console.log(`Wellness Check-In: http://localhost:${PORT}/checkin.html`);
});
