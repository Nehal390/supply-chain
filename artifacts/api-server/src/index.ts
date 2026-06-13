import app from "./app";
import { logger } from "./lib/logger";
import { ensureSeeded } from "./seed";
import { pool } from "@workspace/db";
import { setDbAvailable } from "./db-status";

const port = Number(process.env.PORT || 3000);

async function ensureSchema() {
  if (process.env.NODE_ENV !== "production") return;
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`,
  );
}

async function probeDb(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

async function runStartupTasks() {
  const ok = await probeDb();
  setDbAvailable(ok);
  if (!ok) {
    logger.warn("Database unavailable at startup — serving mock demo data");
    scheduleDbRetry();
    return;
  }
  logger.info("Database available");
  try {
    await ensureSchema();
  } catch (err) {
    logger.warn({ err }, "ensureSchema failed — skipping");
  }
  try {
    await ensureSeeded();
  } catch (err) {
    logger.warn({ err }, "ensureSeeded failed — skipping");
  }
}

function scheduleDbRetry() {
  let attempts = 0;
  const MAX = 10;
  const interval = setInterval(() => {
    attempts++;
    probeDb()
      .then(async (ok) => {
        if (ok) {
          setDbAvailable(true);
          clearInterval(interval);
          logger.info("Database came online — switching to live data");
          try {
            await ensureSchema();
          } catch (err) {
            logger.warn({ err }, "ensureSchema failed on retry");
          }
          try {
            await ensureSeeded();
          } catch (err) {
            logger.warn({ err }, "ensureSeeded failed on retry");
          }
        } else if (attempts >= MAX) {
          clearInterval(interval);
          logger.warn(
            "Database still unavailable after retries — continuing with mock data",
          );
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, 15000);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
  void runStartupTasks();
});
