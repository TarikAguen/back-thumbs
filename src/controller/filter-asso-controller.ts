import { Request, Response } from "express";
import Asso from "../models/Asso";
import { Request, Response } from "express";
import Asso from "../models/Asso";

export const filterAssos = async (req: Request, res: Response) => {
  const { interests, distance, nameasso, longitude, latitude } = req.query;

  const query: any = {};

  // Si la longitude, latitude et la distance sont fournies, on ajoute le filtre géographique
  if (longitude && latitude && distance) {
    const long = parseFloat(longitude as string);
    const lat = parseFloat(latitude as string);
    const radiusInMeters = parseFloat(distance as string) * 1000;

    // Vérification que longitude, latitude, et distance sont bien des nombres valides
    if (!isNaN(long) && !isNaN(lat) && !isNaN(radiusInMeters)) {
      query.location = {
        $near: {
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
  if (nameasso) {
    query.nameasso = { $regex: nameasso, $options: "i" }; // Recherche insensible à la casse
  }

  try {
    // Recherche des associations selon les filtres appliqués
    const assos = await Asso.find(query);
    if (assos.length === 0) {
      return res.status(404).send("Aucune association trouvée.");
    }
    res.json({ message: "Associations filtrées avec succès", assos });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .send("Erreur lors de la filtration des associations: " + err.message);
  }
};
