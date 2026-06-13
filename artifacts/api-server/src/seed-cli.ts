import { pool } from "@workspace/db";
import { ensureSeeded } from "./seed";

ensureSeeded()
  .then(() => pool.end())
  .catch((err) => {
    console.error("[seed-cli] Seed failed", err);
    pool.end();
    process.exit(1);
  });
