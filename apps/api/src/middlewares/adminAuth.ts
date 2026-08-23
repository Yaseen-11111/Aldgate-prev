import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const ADMIN_TOKEN_SECRET = process.env.SESSION_SECRET;

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!ADMIN_TOKEN_SECRET) {
    res.status(503).json({ error: "Local admin authentication is not configured. Use the Cloudflare Access-protected Worker." });
    return;
  }
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
