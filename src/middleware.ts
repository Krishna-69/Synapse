import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config.js";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers["authorization"];

    if (!header) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }
    const decoded = jwt.verify(header as string, JWT_PASSWORD);
    if (decoded) {
      if (typeof decoded === "string") {
        return res.status(403).json({
          message: "You are not logged in",
        });
      }
      req.userId = (decoded as JwtPayload).id;
      next();
    }
  } catch (e) {
    return res.status(404).json({
      message: "Incorect credentials",
    });
  }
};
