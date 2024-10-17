import { Router } from "express";
import multer from "multer";
import {
  updateAsso,
  profilUpdate,
  getAssoDetails,
  deleteAssoProfil,
  getAllAsso,
  getgAssoById,
} from "../controller/update-asso-controller";
const upload = multer({ storage: multer.memoryStorage() }); // Importation du contrôleur

const router = Router();

router.put("/update-asso", upload.single("logo"), updateAsso); // Route qui appelle la fonction du contrôleur
router.post("/profilupdate", profilUpdate); // Route qui appelle la fonction du contrôleur
router.get("/asso-details", getAssoDetails); // Renvoie les details de l'asso
router.delete("/delete", deleteAssoProfil); // Route qui supprime l'asso
router.get("/getAllAsso", getAllAsso); // Route qui renvoie toutes les asso
router.get("/getDetails-user/:id", getgAssoById);

export default router;
