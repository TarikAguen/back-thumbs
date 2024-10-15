import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import s3 from "../config/s3";
import geocodeAddress from "../config/geocode";

// Fonction pour enregistrer un nouvel utilisateur
export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      description,
      presentation,
      birthdate,
      interests,
      genre,
      city,
      postalcode,
      address,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    let photoUrl = undefined;

    if (req.file) {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      photoUrl = uploadResult.Location;
    }

    // Géocodage de l'adresse
    const { latitude, longitude } = await geocodeAddress(address);

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      description,
      presentation,
      birthdate,
      interests,
      genre,
      city,
      postalcode,
      address,
      photo: photoUrl,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    await newUser.save();

    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err: any) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).send("Email already exists");
    } else {
      res.status(500).send("Error registering user: " + err.message);
    }
  }
};

// Fonction pour la connexion d'un utilisateur
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  const user = await User.findOne({ email });

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
export const logout = (req: Request, res: Response) => {
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
