import app from "./app";
import { logger } from "./lib/logger";
import { ensureSeeded } from "./seed";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function ensureSchema() {
  if (process.env.NODE_ENV !== "production") return;
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`,
  );
}

async function runStartupTasks() {
  try {
    await ensureSchema();
  } catch (err) {
    logger.warn({ err }, "ensureSchema failed (DB may be warming up) — skipping");
  }
  try {
    await ensureSeeded();
  } catch (err) {
    logger.warn({ err }, "ensureSeeded failed (DB may be warming up) — skipping");
  }
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
  void runStartupTasks();
});
