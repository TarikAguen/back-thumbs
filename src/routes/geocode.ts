import { Router } from "express";
import {
  updateLocation,
  findNearbyUsers,
} from "../controller/geocode-controller";

const router = Router();

// Route pour maj location user
router.post("/update-location", updateLocation);

// Route pour trouver à proximité de l'user 
router.get("/nearby-users", findNearbyUsers);

export default router;
