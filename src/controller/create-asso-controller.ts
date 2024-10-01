import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Asso from "../models/Asso";
import s3 from "../config/s3";

// Fonction pour l'inscription d'une association
export const registerAsso = async (req: Request, res: Response) => {
  try {
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
      location,
      creationdate,
      interests,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
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

    const newAsso = new Asso({
      email,
      password: hashedPassword,
      nameasso,
      siret,
      logo,
      description,
      presentation,
      website,
      telephone,
      location,
      creationdate,
      interests,
      photo: photoUrl, // Inclure la photo si elle existe
    });

    console.log("Nouvel asso à sauvegarder :", newAsso);
    await newAsso.save();
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

// Fonction pour la connexion d'une association
export const loginAsso = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  const user = await Asso.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const userWithVirtuals = user.toJSON();

    res.json({
      message: `User connected: ${email}`,
      token,
      user: userWithVirtuals,
    });
  } else {
    res.status(401).send("Invalid credentials");
  }
};

// Fonction pour la déconnexion
export const logoutAsso = (req: Request, res: Response) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (token) {
    revokedTokens.add(token);
    res.send("User logged out successfully");
  } else {
    res.status(400).send("No token provided");
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
