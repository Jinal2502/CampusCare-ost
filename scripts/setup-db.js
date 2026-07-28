/**
 * Applies db/schema.sql to Neon using DATABASE_URL from .env
 * Run: npm run db:setup
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL in .env");
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, "..", "db", "schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query(sql);
    console.log("Schema applied successfully (students, wellness_checkins).");
  } catch (err) {
    console.error("Failed to apply schema:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
