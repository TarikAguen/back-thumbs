import { Router } from "express";
import {
  updateAsso,
  profilUpdate,
  getAssoDetails,
  deleteAssoProfil,
  getAllAsso,
} from "../controller/update-asso-controller"; // Importation du contrôleur

const router = Router();

router.put("/update-asso", updateAsso); // Route qui appelle la fonction du contrôleur
router.post("/profilupdate", profilUpdate); // Route qui appelle la fonction du contrôleur
router.get("/asso-details", getAssoDetails); // Renvoie les details de l'asso
router.delete("/delete", deleteAssoProfil); // Route qui supprime l'asso
router.get("/getAllAsso", getAllAsso); // Route qui renvoie toutes les asso

export default router;
