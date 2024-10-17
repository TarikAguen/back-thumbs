import { Router } from "express";
import multer from "multer";
import { updateLocation } from "../controller/geocode-controller";
import {
  updateProfil,
  deleteProfil,
  getProfilDetails,
  getAllInterests,
  getUserInterest,
  getUserById,
} from "../controller/update-profil-controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route pour mettre à jour le profil
router.put(
  "/update-profil",
  upload.single("photo"),
  updateProfil,
  updateLocation
);

// Route pour mettre à jour le profil (autre endpoint)
router.post("/profilupdate", upload.single("photo"), updateProfil);

// Route pour supprimer le profil
router.delete("/delete-profil", deleteProfil);

// Route pour récupérer les détails du profil
router.get("/details", getProfilDetails);
router.get("/getDetails-user/:id", getUserById);

// mdp oublié

router.get("/interests", getAllInterests);
router.get("/user-interests", getUserInterest);

export default router;
