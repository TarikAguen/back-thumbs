import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import Interest from "../models/Interest";
import s3 from "../config/s3";
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

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        password: hashedPassword || undefined,
        lastName,
        birthdate,
        description,
        presentation,
        genre,
        city,
        postalcode,
        address,
        interests,
        ...(photoUrl && { photo: photoUrl }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
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
