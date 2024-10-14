import {
  forgetPassword,
  resetPassword,
} from "../controller/update-profil-controller";
import { Router } from "express";

const router = Router();
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

export default router;
