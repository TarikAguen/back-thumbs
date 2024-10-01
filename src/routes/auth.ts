import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import s3 from "../config/s3";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const revokedTokens: Set<string> = new Set();

router.post("/register", upload.single("photo"), async (req, res) => {
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
      location,
      photo,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // if (!req.file) {
    //   return res.status(201).send("Photo is required" + res.json + req.file);
    // }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      // ACL: "public-read", // Permettre un accès public à la photo
    };

    const uploadResult = await s3.upload(params).promise();

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
      location,
      photo: uploadResult.Location,
    });
    console.log(req.file);

    await newUser.save();
    res.status(201).send("User registered");
  } catch (err: any) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).send("Email already exists");
    } else {
      console.log("Données reçues :", req.body);
      console.log("Fichier reçu :", req.file);
      res.status(500).send("Error registering user" + err.message);
    }
  }
});

router.post("/login", async (req, res) => {
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

    // Convertir l'utilisateur en JSON pour inclure les champs virtuels
    const userWithVirtuals = user.toJSON();

    res.json({
      message: `User connected: ${email}`,
      token,
      user: userWithVirtuals, // Inclure le champ virtuel 'age'
    });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

router.post("/logout", (req, res) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (token) {
    revokedTokens.add(token);
    res.send("User logged out successfully");
  } else {
    res.status(400).send("No token provided");
  }
});

// Middleware pour vérifier la révocation des tokens (à utiliser sur les routes protégées)
const checkRevokedToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (token && revokedTokens.has(token)) {
    return res.status(401).send("Token has been revoked");
  }
  next();
};

export { revokedTokens, checkRevokedToken };
export default router;
