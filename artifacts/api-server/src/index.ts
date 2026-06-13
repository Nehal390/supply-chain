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
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`,
  );
}

ensureSchema()
  .then(() => ensureSeeded())
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Startup failed, aborting");
    process.exit(1);
  });
