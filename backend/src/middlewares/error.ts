// src/middlewares/error.ts
import { Request, Response, NextFunction } from "express";

export function notFound(req: Request, res: Response) {
  res
    .status(404)
    .json({ message: `Cannot ${req.method} ${req.originalUrl}` });
}

export function errorHandler(
  err: Error & Partial<{ statusCode: number }>,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode ?? 500;
  if (statusCode >= 500) {
    console.error("Server error:", err);
  }

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
}
