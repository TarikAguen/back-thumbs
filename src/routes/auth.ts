import { Router } from "express";
import multer from "multer";
import { updateLocation } from "../controller/geocode-controller";
import {
  register,
  login,
  logout,
  checkRevokedToken,
} from "../controller/auth-profil-controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route pour enregistrer un utilisateur
router.post("/register", upload.single("photo"), register, updateLocation);

// Route pour connecter un utilisateur
router.post("/login", login);

// Route pour déconnecter un utilisateur
router.post("/logout", logout);

// Middleware pour vérifier la révocation des tokens
router.use(checkRevokedToken);

export default router;
