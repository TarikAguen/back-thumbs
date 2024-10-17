import { Router } from "express";
import multer from "multer";
import {
  createEvent,
  deleteEvent,
  getUserEvents,
  toggleParticipant,
  getAllEvents,
  filterByInterestsAndType,
  getEventById,
  updateEvent,
} from "../controller/create-event-controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route pour créer un événement
router.post("/create-event", upload.single("photo"), createEvent);
router.get("/getUser-event", getUserEvents);
router.get("/events", getAllEvents);
router.post("/toggle-participant/:id", toggleParticipant);
// Route pour filtrer les événements par intérêts
router.get("/event-filter", filterByInterestsAndType);
router.get("/getEvent/:id", getEventById); // Fonction pour récupérer un événement par ID
// Route pour supprimer un événement
router.delete("/delete-event/:id", deleteEvent); // :id pour spécifier l'événement à supprimer
router.put("/update-event/:id", upload.single("photo"), updateEvent);

export default router;
