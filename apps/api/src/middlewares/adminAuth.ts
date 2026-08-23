import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const ADMIN_TOKEN_SECRET =
  process.env.SESSION_SECRET ?? "aldergate-dev-only-secret";

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, ADMIN_TOKEN_SECRET, {
    expiresIn: "12h",
  });
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  const token =
    header && header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, ADMIN_TOKEN_SECRET);
    if (
      typeof payload !== "object" ||
      payload === null ||
      (payload as { role?: string }).role !== "admin"
    ) {
      res.status(401).json({ error: "Invalid admin session" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired admin session" });
    return;
  }
}
