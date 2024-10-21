import { Request, Response } from "express";
import User from "../models/User";
import Event from "../models/Event";
import Asso from "../models/Asso";
import geocodeAddress from "../config/geocode";

// maj loc
export async function updateLocation(req: Request, res: Response) {
  const { address } = req.body;

  if (typeof address !== "string" || address.trim() === "") {
    return res
      .status(400)
      .send("Address is required and must be a non-empty string.");
  }

  try {
    const { latitude, longitude } = await geocodeAddress(address);

    const userId = res.locals.user.userId;
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

// find  near user
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
    const radiusInMeters = radius * 1000; // m to km

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
    const events = await Event.find({
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
    const asso = await Asso.find({
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

    res.json("Users :" + users + " Fin User.");
    res.json("Events: " + events + "Fin Events.");
    res.json("Asso: " + asso + "Fin asso.");
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
          "rd:" +
          radius
      );
  }
}
