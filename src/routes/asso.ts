import { Router } from "express";
import {
  updateAsso,
  profilUpdate,
  getAssoDetails,
} from "../controller/update-asso-controller"; // Importation du contrôleur

const router = Router();

router.put("/update-asso", updateAsso); // Route qui appelle la fonction du contrôleur
router.post("/profilupdate", profilUpdate); // Route qui appelle la fonction du contrôleur
router.get("/asso-details", getAssoDetails);

export default router;
