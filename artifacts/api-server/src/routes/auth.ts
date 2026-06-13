import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { LoginBody, RegisterBody } from "@workspace/api-zod";
import type { User } from "@workspace/db";

function safeUser(user: User) {
  const { passwordHash: _ph, ...rest } = user;
  void _ph;
  return rest;
}

const router: IRouter = Router();

const DEMO_EMAILS = new Set([
  "admin@scn.in",
  "manager@scn.in",
  "retail@scn.in",
  "customer@scn.in",
]);

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

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(usersTable)
    .values({ email: normalEmail, name, city, role, passwordHash })
    .returning();

  req.session.userId = user!.id;
  res.status(201).json(safeUser(user!));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const normalEmail = email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalEmail));

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (user.passwordHash) {
    const ok = await bcrypt.compare(password, user.passwordHash);
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

  req.session.userId = user.id;
  res.json(safeUser(user));
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
  res.json({ user: user ? safeUser(user) : null });
});

export default router;
