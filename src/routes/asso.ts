import { Router } from "express";
import multer from "multer";
import {
  updateAsso,
  profilUpdate,
  getAssoDetails,
  deleteAssoProfil,
  getAllAsso,
  getgAssoById,
  getOrganizedEventsById,
} from "../controller/update-asso-controller";
import { filterAssos } from "../controller/filter-asso-controller";
const upload = multer({ storage: multer.memoryStorage() }); // Importation du contrôleur

const router = Router();

router.put("/update-asso", upload.single("logo"), profilUpdate); // Route qui appelle la fonction du contrôleur
router.post("/profilupdate", profilUpdate); // Route qui appelle la fonction du contrôleur
router.get("/asso-details", getAssoDetails); // Renvoie les details de l'asso
router.delete("/delete", deleteAssoProfil); // Route qui supprime l'asso
router.get("/getAllAsso", getAllAsso); // Route qui renvoie toutes les asso
router.get("/getDetails-asso/:id", getgAssoById);
router.get("/filter", filterAssos);
// Nouvelle route pour récupérer les événements organisés par une asso spécifique via son ID
router.get("/organized-events/:assoId", getOrganizedEventsById);

export default router;
