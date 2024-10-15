import { Router } from "express";
import multer from "multer";
import { updateLocation } from "../controller/geocode-controller";
import {
  register,
  login,
  logout,
  checkRevokedToken,
} from "../controller/auth-profil-controller";
import {
  forgetPassword,
  resetPassword,
} from "../controller/update-profil-controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route pour enregistrer un utilisateur
router.post("/register", upload.single("photo"), register);

// Route pour connecter un utilisateur
router.post("/login", login);

// Route pour déconnecter un utilisateur
router.post("/logout", logout);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
// Middleware pour vérifier la révocation des tokens
router.use(checkRevokedToken);

export default router;
