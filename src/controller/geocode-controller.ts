import { Request, Response } from "express";
import User from "../models/User";
import geocodeAddress from "../config/geocode";

// Fonction pour mettre à jour la localisation d'un utilisateur
export async function updateLocation(req: Request, res: Response) {
  const { address } = req.body;

  if (typeof address !== "string" || address.trim() === "") {
    return res
      .status(400)
      .send("Address is required and must be a non-empty string.");
  }

  try {
    const { latitude, longitude } = await geocodeAddress(address);

    const userId = res.locals.user.userId; // Utilisation de res.locals pour l'ID utilisateur
    if (!userId) {
      return res.status(403).send("User not identified.");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { "location.coordinates": [longitude, latitude] },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json(user);
  } catch (error) {
    console.error("Failed to update location:", error);
    res.status(500).send("Failed to update location");
  }
}

// Fonction pour trouver des utilisateurs à proximité d'une localisation
export async function findNearbyUsers(req: Request, res: Response) {
  const { long, lat, rad } = req.query;

  if (
    typeof long !== "string" ||
    typeof lat !== "string" ||
    typeof rad !== "string"
  ) {
    return res
      .status(400)
      .send("Longitude, Latitude, and Radius are required as strings.");
  }

  const longitude = parseFloat(long);
  const latitude = parseFloat(lat);
  const radiusInKm = parseFloat(rad);

  if (isNaN(longitude) || isNaN(latitude) || isNaN(radiusInKm)) {
    return res
      .status(400)
      .send("Longitude, Latitude, and Radius must be valid numbers.");
  }

  try {
    const radiusInMeters = radiusInKm * 1000; // Convertir les kilomètres en mètres

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
    res
      .status(500)
      .send(
        "Failed to find nearby users" +
          "test:" +
          long +
          " lat : " +
          lat +
          "rad:" +
          radiusInKm
      );
  }
}
