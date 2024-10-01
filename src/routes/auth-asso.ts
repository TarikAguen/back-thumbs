import { Router } from "express";
import multer from "multer";
import {
  registerAsso,
  loginAsso,
  logoutAsso,
  checkRevokedToken,
} from "../controller/create-asso-controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route pour l'inscription
router.post("/register-asso", upload.single("logo"), registerAsso);

// Route pour la connexion
router.post("/login", loginAsso);

// Route pour la déconnexion
router.post("/logout", logoutAsso);

// Middleware pour vérifier la révocation des tokens
router.use(checkRevokedToken);

export default router;
