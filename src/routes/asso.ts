import { Router } from "express";
import { updateAsso, profilUpdate } from "../controller/update-asso-controller"; // Importation du contrôleur

const router = Router();

router.put("/update-asso", updateAsso); // Route qui appelle la fonction du contrôleur
router.post("/profilupdate", profilUpdate); // Route qui appelle la fonction du contrôleur

export default router;
