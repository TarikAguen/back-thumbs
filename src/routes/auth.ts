import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../models/User";
import { s3 } from "../config/aws-config";

const router = Router();
const upload = multer({ dest: "uploads/" }); // Gérer les photos
const revokedTokens: Set<string> = new Set();

// Fonction pour uploader des fichiers sur S3
async function uploadFileToS3(file: Express.Multer.File) {
  const { originalname, buffer } = file;
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${Date.now()}_${originalname}`,
    Body: buffer,
    ACL: "public-read",
  };

  try {
    const { Location } = await s3.upload(uploadParams).promise();
    return Location; // URL de l'image téléchargée
  } catch (err) {
    console.error("Failed to upload photo to S3:", err);
    throw err;
  }
}

// Route d'enregistrement
router.post("/register", upload.single("photo"), async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    description,
    age,
    interest,
    genre,
    location,
  } = req.body;

  const file = req.file; // Accès au fichier téléchargé
  if (!file) {
    return res.status(400).send("No photo uploaded");
  }

  try {
    const photoUrl = await uploadFileToS3(file); // Attendre l'upload avant de créer l'utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      description,
      age,
      interest,
      photo: photoUrl, // Utiliser l'URL retournée par S3
      genre,
      location,
    });

    await newUser.save();
    res.status(201).send("User registered");
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).send("Email already exists");
    } else {
      res.status(500).send("Error registering user");
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
    res.json({
      message: `User connected: ${email}`,
      token,
      user: {
        email: user.email,
      },
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
