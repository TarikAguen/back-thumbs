import { Request, Response } from "express";
import geocodeAddress from "../config/geocode";
import Event from "../models/Event";
export const filterEvents = async (req: Request, res: Response) => {
  const { interests, distance, eventName } = req.query;
  const { longitude, latitude } = req.query; // Assurez-vous que ces valeurs sont passées en tant que query params

  const long = parseFloat(longitude as string);
  const lat = parseFloat(latitude as string);
  const radiusInMeters = parseFloat(distance as string) * 1000;

  const query = {
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [long, lat] },
        $maxDistance: radiusInMeters,
      },
    },
    ...(interests && { interests: { $in: interests } }),
    ...(eventName && { eventName: { $regex: eventName, $options: "i" } }),
  };

  try {
    const events = await Event.find(query).sort({ creationdate: -1 }); // Plus récent au plus vieux
    if (events.length === 0) {
      return res.status(404).send("Aucun événement trouvé.");
    }
    res.json({ message: "Événements filtrés avec succès", events });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .send("Erreur lors de la filtration des événements: " + err.message);
  }
};
