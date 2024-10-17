import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import Interest from "../models/Interest";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import s3 from "../config/s3";
import geocodeAddress from "../config/geocode";
import { v4 as uuidv4 } from "uuid";

// Fonction pour mettre à jour le profil utilisateur
export const updateProfil = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const {
    firstName,
    password,
    lastName,
    birthdate,
    description,
    presentation,
    interests,
    genre,
    city,
    postalcode,
    address,
  } = req.body;

  try {
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let photoUrl = undefined;
    if (req.file) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `${uuidv4()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      photoUrl = uploadResult.Location;
    }

    const updateData = {
      firstName,
      lastName,
      birthdate,
      description,
      presentation,
      genre,
      city,
      postalcode,
      address,
      interests,
      ...(hashedPassword && { password: hashedPassword }),
      ...(photoUrl && { photo: photoUrl }),
    };

    // Mise à jour des informations de l'utilisateur sans la localisation
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    // Géocodage de l'adresse et mise à jour de la localisation si l'adresse est fournie
    if (address) {
      const { latitude, longitude } = await geocodeAddress(address);

      const locationUpdate = await User.findByIdAndUpdate(
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
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).send("Error updating user: " + err.message);
  }
};
// Fonction pour supprimer le profil utilisateur
export const deleteProfil = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).send("User not found");
    }
    res.send("User deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
};

// Fonction pour récupérer les détails du profil utilisateur
export const getProfilDetails = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving user information");
  }
};
export const getAllInterests = async (req: Request, res: Response) => {
  try {
    const interestDocument = await Interest.findOne();

    if (!interestDocument) {
      return res.status(404).send("Aucun centre d'intérêt trouvé");
    }

    res.json({
      message: "Liste des centres d'intérêts",
      interests: interestDocument.centres_interets,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send("Erreur lors de la récupération des centres d'intérêts");
  }
};

export const getUserInterest = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;

  try {
    const user = await User.findById(userId).populate(
      "interests",
      "nom thematique"
    );

    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    res.json({
      message: "Centres d'intérêts de l'utilisateur",
      interests: user.interests, // Cela affichera les centres d'intérêts avec leurs noms et thématiques
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Erreur lors de la récupération des centres d'intérêts de l'utilisateur"
      );
  }
};
export const forgetPassword = async (req: Request, res: Response) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: req.body.email });

    // si pas d'email de trouvé alors erreur
    if (!user) {
      return res.status(404).send({ message: "Email not found" });
    }

    // génération d'un token contenant l'email
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!, {
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
export const resetPassword = async (req: Request, res: Response) => {
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
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    // Mettre à jour le mot de passe de l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.json({
      message: "Password updated successfully",
      user: updatedUser,
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
export const getUserById = async (req: Request, res: Response) => {
  const eventId = req.params.id;

  try {
    // Rechercher par ID dans la bdd
    const user = await User.findById(eventId);

    if (!user) {
      return res.status(404).send("Événement non trouvé");
    }

    // Renvoyer les données de l'événement
    res.json({
      message: "Détails de l'événement récupérés avec succès",
      event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de la récupération de l'événement");
  }
};
