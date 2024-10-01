import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Event from "../models/Event";
import s3 from "../config/s3";

// Fonction pour l'inscription d'une association
export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      eventName,
      organisator,
      description,
      subdescription,
      location,
      participants,
      interests,
    } = req.body;

    let photoUrl = undefined;

    // Si un fichier est uploadé, nous l'envoyons à S3
    if (req.file) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      photoUrl = uploadResult.Location; // Stocker l'URL de la photo
    }

    const newEvent = new Event({
      eventName,
      organisator,
      description,
      subdescription,
      location,
      participants,
      interests,
      photo: photoUrl, // Inclure la photo si elle existe
    });

    console.log("Nouvel asso à sauvegarder :", newEvent);
    await newEvent.save();
    res.status(201).send("Asso registered");
  } catch (err: any) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).send("Email already exists");
    } else {
      res.status(500).send("Error registering Asso: " + err.message);
    }
  }
};

// Fonction pour supprimer un événement
export const deleteEvent = async (req: Request, res: Response) => {
  const eventId = req.params.id;

  try {
    console.log(eventId);
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).send("Event not found");
    }

    res.status(200).send("Event deleted successfully");
  } catch (err: any) {
    console.log(eventId);
    console.error(err);
    res.status(500).send("Error deleting event: " + err.message);
  }
};
export const getUserEvents = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId; // L'ID de l'utilisateur connecté

  try {
    // Rechercher les événements où l'utilisateur est dans la liste des participants par son ID
    const events = await Event.find({ "participants.id": userId });

    if (events.length === 0) {
      return res
        .status(404)
        .send("Aucun événement trouvé pour cet utilisateur");
    }

    res.json({
      message: "Événements récupérés avec succès",
      events,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la récupération des événements");
  }
};

// Fonction pour ajouter ou supprimer un participant de l'événement
export const toggleParticipant = async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const { id, firstName, lastName } = res.locals.user;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send("Événement non trouvé");
    }

    // Assure-toi que `participants` est bien un tableau
    if (!event.participants) {
      event.participants = []; // Initialisation au besoin
    }

    const participantIndex = event.participants.findIndex(
      (participant) => participant.id.toString() === id
    );

    if (participantIndex === -1) {
      // Ajouter l'utilisateur s'il n'est pas déjà dans la liste
      event.participants.push({ id, firstName, lastName });
      await event.save();
      res.status(200).json({ message: "Participant ajouté à l'événement" });
    } else {
      // Retirer l'utilisateur s'il est déjà dans la liste
      event.participants.splice(participantIndex, 1);
      await event.save();
      res.status(200).json({ message: "Participant retiré de l'événement" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la mise à jour des participants");
  }
};
// Fonction pour récupérer tous les événements
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find(); // Récupérer tous les événements dans la base de données

    if (events.length === 0) {
      return res.status(404).send("Aucun événement trouvé");
    }

    res.json({
      message: "Événements récupérés avec succès",
      events,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la récupération des événements");
  }
};
// Middleware pour vérifier la révocation des tokens
export const checkRevokedToken = (req: Request, res: Response, next: any) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (token && revokedTokens.has(token)) {
    return res.status(401).send("Token has been revoked");
  }
  next();
};

// Set pour stocker les tokens révoqués
export const revokedTokens: Set<string> = new Set();
