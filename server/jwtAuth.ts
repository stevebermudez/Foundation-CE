import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const jwtAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET || "fallback-secret") as {
      id: string;
      email: string;
    };
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
