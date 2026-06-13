import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, pool, usersTable } from "@workspace/db";
import { LoginBody, RegisterBody } from "@workspace/api-zod";

const router: IRouter = Router();

const DEMO_EMAILS = new Set([
  "admin@scn.in",
  "manager@scn.in",
  "retail@scn.in",
  "customer@scn.in",
]);

type UserRow = {
  id: number;
  email: string;
  name: string;
  role: string;
  city: string;
  created_at: Date;
};

type UserRowWithHash = UserRow & { password_hash: string | null };

function toResponse(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    city: row.city,
    createdAt: row.created_at,
  };
}

let _pwColExists: boolean | null = null;
async function pwColExists(): Promise<boolean> {
  if (_pwColExists !== null) return _pwColExists;
  const r = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'password_hash'
     ) AS exists`,
  );
  _pwColExists = r.rows[0]?.exists ?? false;
  return _pwColExists;
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, name, city, role } = parsed.data;
  const normalEmail = email.toLowerCase().trim();

  if (DEMO_EMAILS.has(normalEmail)) {
    res.status(400).json({ error: "That email is reserved for demo access" });
    return;
  }

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, normalEmail));

  if (existing) {
    res.status(400).json({ error: "An account with that email already exists" });
    return;
  }

  let user: UserRow;

  if (await pwColExists()) {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query<UserRow>(
      `INSERT INTO users (email, name, role, city, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, city, created_at`,
      [normalEmail, name, role, city, passwordHash],
    );
    user = result.rows[0]!;
  } else {
    const [u] = await db
      .insert(usersTable)
      .values({ email: normalEmail, name, city, role })
      .returning();
    user = { id: u!.id, email: u!.email, name: u!.name, role: u!.role, city: u!.city, created_at: u!.createdAt };
  }

  req.session.userId = user.id;
  res.status(201).json(toResponse(user));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const normalEmail = email.toLowerCase().trim();

  let row: UserRow | undefined;

  if (await pwColExists()) {
    const result = await pool.query<UserRowWithHash>(
      `SELECT id, email, name, role, city, created_at, password_hash
       FROM users WHERE email = $1`,
      [normalEmail],
    );
    const r = result.rows[0];
    if (!r) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    if (r.password_hash) {
      const ok = await bcrypt.compare(password, r.password_hash);
      if (!ok) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
    } else {
      if (password !== "demo1234") {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
    }
    row = r;
  } else {
    const [u] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalEmail));
    if (!u) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    if (password !== "demo1234") {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    row = { id: u.id, email: u.email, name: u.name, role: u.role, city: u.city, created_at: u.createdAt };
  }

  req.session.userId = row.id;
  res.json(toResponse(row));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  await new Promise<void>((resolve) => {
    req.session.destroy(() => resolve());
  });
  res.sendStatus(204);
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = req.session.userId;
  if (!userId) {
    res.json({ user: null });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  res.json({ user: user ?? null });
});

export default router;
