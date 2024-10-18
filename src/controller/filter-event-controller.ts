import { Request, Response } from "express";
import Event from "../models/Event";

export const filterEvents = async (req: Request, res: Response) => {
  const { interests, distance, eventName, longitude, latitude } = req.query;

  const query: any = {};

  // Si la longitude, latitude et la distance sont fournies, on ajoute le filtre géographique
  if (longitude && latitude && distance) {
    if (
      typeof longitude !== "string" ||
      typeof latitude !== "string" ||
      typeof distance !== "string"
    ) {
      return res
        .status(400)
        .send("Longitude, Latitude, and Radius are required as strings.");
    }
    const long = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const radiusInMeters = parseFloat(distance) * 1000;

    // Vérification que longitude, latitude, et distance sont bien des nombres valides
    if (!isNaN(long) && !isNaN(lat) && !isNaN(radiusInMeters)) {
      query.location = {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [long, lat] },
          $maxDistance: radiusInMeters,
        },
      };
    } else {
      return res
        .status(400)
        .send(
          "Les paramètres 'longitude', 'latitude' et 'distance' doivent être des nombres valides."
        );
    }
  }

  // Si des intérêts sont fournis, on ajoute le filtre des intérêts
  if (interests) {
    query.interests = { $in: interests };
  }

  // Si un nom d'association est fourni, on ajoute le filtre par nom
  if (eventName) {
    query.nameasso = { $regex: eventName, $options: "i" }; // Recherche insensible à la casse
  }

  try {
    // Recherche des associations selon les filtres appliqués
    const events = await Event.find(query);
    if (events.length === 0) {
      return res.status(404).send("Aucune association trouvée.");
    }
    res.json({ message: "Associations filtrées avec succès", events });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .send("Erreur lors de la filtration des associations: " + err.message);
  }
};
