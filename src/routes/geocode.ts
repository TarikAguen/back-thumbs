import { Router } from "express";
import {
  updateLocation,
  findNearbyUsers,
} from "../controller/geocode-controller"; // Assure-toi que les noms de fonctions sont corrects

const router = Router();

// Route pour mettre à jour la localisation de l'utilisateur
router.post("/update-location", updateLocation);

// Route pour trouver des utilisateurs à proximité
router.get("/nearby-users", findNearbyUsers);

export default router;
