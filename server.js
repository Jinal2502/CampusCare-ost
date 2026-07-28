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

/** Calendar "today" in IST (CampusCare audience) — YYYY-MM-DD */
function todayISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** pg DATE → YYYY-MM-DD string (avoid timezone shift) */
function dateToISO(value) {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  // node-pg may give local-midnight Date; use local Y/M/D parts
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
  return { start, end, year: y, month: m };
}

async function findStudentByEmail(email) {
  const result = await pool.query(
    `SELECT id, full_name, email, course, year, created_at
     FROM students WHERE lower(email) = lower($1)`,
    [email.trim()]
  );
  return result.rows[0] || null;
}

/** Onboard or return existing student by email */
app.post("/api/students", async (req, res) => {
  try {
    const { full_name, email, course, year } = req.body || {};

    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }

    const existing = await findStudentByEmail(email);
    if (existing) {
      return res.json({ student: existing, created: false });
    }

    const insert = await pool.query(
      `INSERT INTO students (full_name, email, course, year)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, course, year, created_at`,
      [
        String(full_name).trim(),
        String(email).trim().toLowerCase(),
        course ? String(course).trim() : null,
        year ? String(year).trim() : null,
      ]
    );

    return res.status(201).json({ student: insert.rows[0], created: true });
  } catch (err) {
    console.error("POST /api/students", err);
    return res.status(500).json({ error: "Could not save student." });
  }
});

/** Lookup student by email */
app.get("/api/students", async (req, res) => {
  try {
    const email = req.query.email;
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email query is required." });
    }
    const student = await findStudentByEmail(email);
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }
    return res.json({ student });
  } catch (err) {
    console.error("GET /api/students", err);
    return res.status(500).json({ error: "Could not load student." });
  }
});

/** Upsert today's (or given date) check-in */
app.post("/api/checkins", async (req, res) => {
  try {
    const { email, mood, energy, stress, note, checkin_date } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }

    const moodN = clampScore(mood);
    const energyN = clampScore(energy);
    const stressN = clampScore(stress);
    if (moodN === null || energyN === null || stressN === null) {
      return res.status(400).json({ error: "Mood, energy, and stress must be integers 1–5." });
    }

    const student = await findStudentByEmail(email);
    if (!student) {
      return res.status(404).json({ error: "Student not found. Please onboard first." });
    }

    const date = checkin_date && /^\d{4}-\d{2}-\d{2}$/.test(checkin_date)
      ? checkin_date
      : todayISO();

    const result = await pool.query(
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
        student.id,
        date,
        moodN,
        energyN,
        stressN,
        note ? String(note).trim().slice(0, 500) : null,
      ]
    );

    return res.status(201).json({ checkin: mapCheckin(result.rows[0]) });
  } catch (err) {
    console.error("POST /api/checkins", err);
    return res.status(500).json({ error: "Could not save check-in." });
  }
});

/** Month check-ins + stats for calendar */
app.get("/api/checkins", async (req, res) => {
  try {
    const email = req.query.email;
    const month = req.query.month;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email query is required." });
    }

    const range = parseMonth(month);
    if (!range) {
      return res.status(400).json({ error: "month must be YYYY-MM." });
    }

    const student = await findStudentByEmail(email);
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const result = await pool.query(
      `SELECT id, to_char(checkin_date, 'YYYY-MM-DD') AS checkin_date,
              mood, energy, stress, note, created_at
       FROM wellness_checkins
       WHERE student_id = $1
         AND checkin_date >= $2::date
         AND checkin_date <= $3::date
       ORDER BY checkin_date ASC`,
      [student.id, range.start, range.end]
    );

    const rows = result.rows.map(mapCheckin);
    const count = rows.length;
    const avgStress =
      count === 0
        ? null
        : Math.round((rows.reduce((sum, r) => sum + r.stress, 0) / count) * 10) / 10;
    const latest = count === 0 ? null : rows[rows.length - 1];

    return res.json({
      student: { id: student.id, full_name: student.full_name, email: student.email },
      month,
      checkins: rows,
      stats: {
        count,
        avg_stress: avgStress,
        latest_mood: latest ? latest.mood : null,
      },
    });
  } catch (err) {
    console.error("GET /api/checkins", err);
    return res.status(500).json({ error: "Could not load check-ins." });
  }
});

/** Today's check-in for prefill */
app.get("/api/checkins/today", async (req, res) => {
  try {
    const email = req.query.email;
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email query is required." });
    }

    const student = await findStudentByEmail(email);
    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const result = await pool.query(
      `SELECT id, to_char(checkin_date, 'YYYY-MM-DD') AS checkin_date,
              mood, energy, stress, note, created_at
       FROM wellness_checkins
       WHERE student_id = $1 AND checkin_date = $2::date`,
      [student.id, todayISO()]
    );

    return res.json({
      student: { id: student.id, full_name: student.full_name, email: student.email },
      checkin: result.rows[0] ? mapCheckin(result.rows[0]) : null,
      today: todayISO(),
    });
  } catch (err) {
    console.error("GET /api/checkins/today", err);
    return res.status(500).json({ error: "Could not load today's check-in." });
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

app.listen(PORT, () => {
  console.log(`CampusCare running at http://localhost:${PORT}`);
  console.log(`Wellness Check-In: http://localhost:${PORT}/checkin.html`);
});
