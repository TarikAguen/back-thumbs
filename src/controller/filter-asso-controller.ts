import { Request, Response } from "express";
import Asso from "../models/Asso";
export const filterAssos = async (req: Request, res: Response) => {
  const { interests, distance, nameasso } = req.query;
  const { longitude, latitude } = req.query;

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
    ...(nameasso && { nameasso: { $regex: nameasso, $options: "i" } }),
  };

  try {
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
