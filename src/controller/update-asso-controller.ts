import { Request, Response } from "express";
import Asso from "../models/Asso";
import s3 from "../config/s3";
import multer from "multer";
import bcrypt from "bcrypt";
import geocodeAddress from "../config/geocode";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Event from "../models/Event";

// put update photo
export const updateAsso = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const {
    email,
    password,
    nameasso,
    siret,
    logo,
    description,
    presentation,
    website,
    telephone,
    city,
    postalcode,
    address,
    creationdate,
    interests,
  } = req.body;
  let logoUrl = undefined;

  // if file uploaded
  if (req.file) {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      // ACL: "public-read", // Permettre un accès public à la photo
    };

    const uploadResult = await s3.upload(params).promise();
    logoUrl = uploadResult.Location;
  }
  try {
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Hasher le nouveau mot de passe si fourni
    }
    const updatedUser = await Asso.findByIdAndUpdate(
      userId,
      {
        email,
        nameasso,
        siret,
        logo: logoUrl,
        description,
        presentation,
        website,
        telephone,
        city,
        postalcode,
        address,
        creationdate,
        interests,
        ...(hashedPassword && { password: hashedPassword }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("Asso not found");
    }
    // Géocodage de l'adresse et mise à jour de la localisation si l'adresse est fournie
    if (address) {
      const { latitude, longitude } = await geocodeAddress(address);

      const locationUpdate = await Asso.findByIdAndUpdate(
        userId,
        {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
        { new: true }
      );

      if (!locationUpdate) {
        return res.status(404).send("Failed to update user location");
      }

      return res.json({
        message: "User and location updated successfully",
        user: locationUpdate,
      });
    }
    res.json({
      message: "Asso updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).send("Error updating asso");
  }
};

// put update asso
export const profilUpdate = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const {
    email,
    password,
    nameasso,
    siret,
    logo,
    description,
    website,
    telephone,
    city,
    postalcode,
    address,
    creationdate,
    interests,
  } = req.body;

  try {
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10); // Hasher le nouveau mot de passe si fourni
    }

    // Créer l'objet de mise à jour de façon conditionnelle
    const updateData = {
      email,
      nameasso,
      siret,
      logo,
      description,
      website,
      telephone,
      city,
      postalcode,
      address,
      creationdate,
      interests,
      ...(hashedPassword && { password: hashedPassword }), // N'ajouter que si le mot de passe est défini
    };

    let logoUrl = undefined;

    // Gestion du téléchargement de fichier si un logo est fourni
    if (req.file) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      logoUrl = uploadResult.Location;
    }

    // Si un logo a été mis à jour, ajouter la nouvelle URL du logo
    if (logoUrl) {
      updateData.logo = logoUrl;
    }

    // Mettre à jour l'association avec les nouvelles données
    const postUser = await Asso.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!postUser) {
      return res.status(404).send("Association non trouvée");
    }

    res.json({
      message: "Association mise à jour avec succès",
      user: postUser,
    });
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour du profil de l'association:",
      err
    );
    res.status(500).send("Erreur lors de la mise à jour de l'association");
  }
};
export const getAssoDetails = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;

  try {
    const asso = await Asso.findById(userId).select("-password");
    if (!asso) {
      return res.status(404).send("Asso not found");
    }
    res.json(asso);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving asso information");
  }
};

// Asso deletion
export const deleteAssoProfil = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;

  try {
    // verify if this user is an asso existing
    const asso = await Asso.findById(userId);
    if (!asso) {
      return res.status(404).send("Association non trouvée");
    }

    // deletion of event when organisator is our asso
    await Event.deleteMany({ organisator: userId });

    // supression de l'asso
    const deletedAsso = await Asso.findByIdAndDelete(userId);
    if (!deletedAsso) {
      return res.status(404).send("Association non trouvée");
    }

    res.send("Association et événements associés supprimés avec succès");
  } catch (err: any) {
    console.error(err);
    res.status(500).send("Erreur lors de la suppression de l'association");
  }
};

// Fonction pour récupérer toutes les asso
export const getAllAsso = async (req: Request, res: Response) => {
  try {
    const asso = await Asso.find(); // Récupérer toutes les asso dans la base de données

    if (asso.length === 0) {
      return res.status(404).send("Aucune asso trouvée");
    }

    res.json({
      message: "Associations récupérées avec succès",
      asso,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la récupération des asso");
  }
};

export const forgetPasswordAsso = async (req: Request, res: Response) => {
  try {
    // Find the user by email
    const asso = await Asso.findOne({ email: req.body.email });

    // si pas d'email de trouvé alors erreur
    if (!asso) {
      return res.status(404).send({ message: "Email not found" });
    }

    // génération d'un token contenant l'email
    const token = jwt.sign({ email: asso.email }, process.env.JWT_SECRET!, {
      expiresIn: "10m",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    // mail config
    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: "Mot de passe oublié",
      html: `<h1>Réinitialisé votre mot de passe</h1>
    <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe: </p>
    <a href="https://app-thumbs.netlify.app/reset-password/${token}">https://app-thumbs.netlify.app/reset-password/${token}</a>
    <p>Ce lien expire dans 10 minutes</p>
    <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, merci de ne pas tenir compte de ce mail</p>`,
    };

    // envoie du mail
    transporter.sendMail(mailOptions, (err: any, info: any) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: "Email sent" });
    });
  } catch (err: any) {
    res.status(500).send({ message: err.message });
  }
};
export const resetPasswordAsso = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return res.status(400).send({ message: "Token is required" });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // S'assurer que decoded est un objet et contient l'email
    if (typeof decoded !== "object" || !decoded.email) {
      return res.status(400).send({ message: "Invalid token" });
    }

    // Trouver l'utilisateur par l'email inclus dans le token
    const asso = await Asso.findOne({ email: decoded.email });

    if (!asso) {
      return res.status(404).send({ message: "Asso not found" });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    // Mettre à jour le mot de passe de l'utilisateur
    const updatedAsso = await Asso.findByIdAndUpdate(
      asso._id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedAsso) {
      return res.status(404).send("User not found");
    }

    res.json({
      message: "Password updated successfully",
      user: updatedAsso,
    });
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({ message: "Invalid or expired token" });
    }
    console.error(err);
    res.status(500).send({ message: "Error updating password" });
  }
};

// Fonction pour récupérer un événement par ID
export const getgAssoById = async (req: Request, res: Response) => {
  const assoId = req.params.id;

  try {
    // Rechercher par ID dans la bdd
    const asso = await Asso.findById(assoId);

    if (!asso) {
      return res.status(404).send("Asso non trouvé");
    }

    // Renvoyer les données de l'événement
    res.json({
      message: "Détails de l'asso récupérés avec succès",
      asso,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la récupération de l'asso");
  }
};

// Fonction pour récupérer tous les événements organisés par une association spécifique
export const getOrganizedEventsById = async (req: Request, res: Response) => {
  const assoId = req.params.assoId;
  try {
    // Rechercher tous les event où l'assoc avec l'ID donné est l'organisator
    const events = await Event.find({ organisator: assoId });

    if (events.length === 0) {
      return res
        .status(404)
        .send("Aucun événement trouvé pour cette association");
    }

    res.json({
      message: "Événements organisés récupérés avec succès",
      events,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des événements:", err);
    res.status(500).send("Erreur lors de la récupération des événements");
  }
};
