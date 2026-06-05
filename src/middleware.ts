import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config.js";


export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string, JWT_PASSWORD)
    if (decoded) {
        if (typeof decoded === "string") {
                return res.status(403).json({
                message: "You are not logged in"
            })
        }
        req.userId = (decoded as JwtPayload).id;
        next();
    } else {
        return res.status(404).json({
            message: "Incorect credentials"
        })
    }

}
