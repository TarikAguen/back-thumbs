import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { revokedTokens } from "../controller/auth-profil-controller";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.split(" ")[1];

  // Vérification de la présence du token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided. Authorization required.",
    });
  }

  // Vérification si le token a été révoqué
  if (revokedTokens.has(token)) {
    return res.status(401).json({
      success: false,
      message: "Token has been revoked.",
    });
  }

  // Vérification du token avec jwt
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      // Différenciation des types d'erreurs de validation JWT
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired.",
        });
      }

      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token.",
        });
      }

      // Gestion d'autres types d'erreurs
      return res.status(403).json({
        success: false,
        message: "Forbidden. Could not authenticate token.",
      });
    }

    // Si tout va bien, stocker l'utilisateur dans res.locals
    res.locals.user = user as { userId: string; email: string };
    next();
  });
};
