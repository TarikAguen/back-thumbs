import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { revokedTokens } from "../routes/auth";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (token) {
    if (revokedTokens.has(token)) {
      return res.status(401).send("Token has been revoked");
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
      if (err) {
        console.log(err)
        return res.sendStatus(403);
      }
      res.locals.user = user as { userId: string; email: string };
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
