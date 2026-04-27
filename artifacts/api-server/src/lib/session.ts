import session from "express-session";

const secret = process.env["SESSION_SECRET"] ?? "dev-supply-chain-secret";

export const sessionMiddleware = session({
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}
