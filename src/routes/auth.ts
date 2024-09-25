import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../models/User";
import { s3 } from "../config/aws-config";

const router = Router();
const upload = multer({ dest: "uploads/" }); // Gérer les photos
const revokedTokens: Set<string> = new Set();


router.post("/register", async (req, res) => {
  try {
      const { email, password, firstName, lastName, description, age, interests, genre, location } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          description,
          age,
          interests,
          photo,
          genre,
          location
      });
      await newUser.save();
      res.status(201). send("User registered");
  } catch (err: any) {
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
