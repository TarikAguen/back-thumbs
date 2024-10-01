import { Router } from "express";
import multer from "multer";
import {
  createEvent,
  deleteEvent,
} from "../controller/create-event-controller"; // Importer les fonctions du contrôleur

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route pour créer un événement
router.post("/create-event", upload.single("photo"), createEvent);

// Route pour supprimer un événement
router.delete("/delete-event/:id", deleteEvent); // :id pour spécifier l'événement à supprimer

export default router;
