import { Request, Response } from "express";
import Asso from "../models/Asso";
import s3 from "../config/s3";
import multer from "multer";
import bcrypt from "bcrypt";

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
    const updatedUser = await Asso.findByIdAndUpdate(
      userId,
      {
        email,
        password,
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
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("Asso not found");
    }

    res.json({
      message: "Asso updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).send("Error updating asso");
  }
};

// post update asso
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
    const postUser = await Asso.findByIdAndUpdate(
      userId,
      {
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
      },
      { new: true }
    );
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

    if (!postUser) {
      return res.status(404).send("Asso not found");
    }

    res.json({
      message: "Asso updated successfully",
      user: postUser,
    });
  } catch (err) {
    res.status(500).send("Error updating user");
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

// Supprimer asso profil
export const deleteAssoProfil = async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;

  try {
    //check si user est une asso
    const asso = await Asso.findById(userId);
    if (!asso) {
      return res.status(404).send("Association non trouvée");
    }

    // Supprimer l'association
    const deletedAsso = await Asso.findByIdAndDelete(userId);
    if (!deletedAsso) {
      return res.status(404).send("Association non trouvée");
    }

    res.send("Association supprimée avec succès");
  } catch (err) {
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
