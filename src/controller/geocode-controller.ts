import { Request, Response } from "express";
import User from "../models/User";
import geocodeadress from "../config/geocode";

// Fonction pour mettre à jour la localisation d'un utilisateur
export async function updateLocation(req: Request, res: Response) {
  const { adress } = req.body; // L'adresse est supposée venir du corps de la requête

  if (typeof adress !== "string" || adress.trim() === "") {
    return res
      .status(400)
      .send("adress is required and must be a non-empty string.");
  }

  try {
    // Convertir l'adresse en coordonnées géographiques
    const { latitude, longitude } = await geocodeadress(adress);

    // Mettre à jour l'utilisateur avec les nouvelles coordonnées
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        "location.coordinates": [longitude, latitude],
      },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    console.error("Failed to update location:", error);
    res.status(500).send("Failed to update location");
  }
}

// Fonction pour trouver des utilisateurs à proximité d'une localisation
export async function findNearbyUsers(req: Request, res: Response) {
  const { longitude, latitude, radiusInKm } = req.query;

  if (
    typeof longitude !== "string" ||
    typeof latitude !== "string" ||
    typeof radiusInKm !== "string"
  ) {
    return res
      .status(400)
      .send("Longitude, Latitude, and Radius are required as strings.");
  }

  const long = parseFloat(longitude);
  const lat = parseFloat(latitude);
  const radius = parseFloat(radiusInKm);

  if (isNaN(long) || isNaN(lat) || isNaN(radius)) {
    return res
      .status(400)
      .send("Longitude, Latitude, and Radius must be valid numbers.");
  }

  try {
    const radiusInMeters = radius * 1000; // Convertir les kilomètres en mètres

    const users = await User.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [long, lat],
          },
          $maxDistance: radiusInMeters,
        },
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Failed to find nearby users:", error);
    res.status(500).send("Failed to find nearby users");
  }
}
