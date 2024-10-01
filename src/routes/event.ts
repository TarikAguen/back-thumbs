import { Router } from "express";
import multer from "multer";
import {
  createEvent,
  deleteEvent,
  getUserEvents,
  toggleParticipant,
  getAllEvents,
} from "../controller/create-event-controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route pour créer un événement
router.post("/create-event", upload.single("photo"), createEvent);
router.get("/getUser-event", getUserEvents);
router.get("/events", getAllEvents);
router.post("/event/:id/toggle-participant", toggleParticipant);

// Route pour supprimer un événement
router.delete("/delete-event/:id", deleteEvent); // :id pour spécifier l'événement à supprimer

export default router;
