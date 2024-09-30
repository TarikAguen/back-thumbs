import { Router, Request, Response, NextFunction } from "express";
import User from "../models/User";
import Interest from "../models/Interest";
import bcrypt from "bcrypt";
import multer from "multer";
import s3 from "../config/s3";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.put(
  "/update-profil",
  upload.single("photo"),
  async (req: Request, res: Response) => {
    const userId = res.locals.user.userId;
    const {
      firstName,
      password,
      lastName,
      birthdate,
      description,
      presentation,
      interests,
      location,
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
          location,
          interests,
          ...(photoUrl && { photo: photoUrl }), // Met à jour la photo uniquement si elle est fournie
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
  }
);

router.post(
  "/profilupdate",
  upload.single("photo"),
  async (req: Request, res: Response) => {
    const userId = res.locals.user.userId;
    const {
      firstName,
      lastName,
      password,
      birthdate,
      description,
      presentation,
      interests,
      location,
    } = req.body;

    try {
      let hashedPassword = undefined;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Upload de la nouvelle photo si elle est fournie
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

      const postUser = await User.findByIdAndUpdate(
        userId,
        {
          firstName,
          password: hashedPassword || undefined,
          lastName,
          birthdate,
          description,
          presentation,
          interests,
          location,
          ...(photoUrl && { photo: photoUrl }), // Met à jour la photo uniquement si elle est fournie
        },
        { new: true }
      );

      if (!postUser) {
        return res.status(404).send("User not found");
      }

      res.json({
        message: "User updated successfully",
        user: postUser,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating user");
    }
  }
);
router.delete("/delete-profil", async (req: Request, res: Response) => {
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
});

router.get("/details", async (req: Request, res: Response) => {
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
});

router.get("/interests", async (req: Request, res: Response) => {
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
});

router.get("/user/interests", async (req: Request, res: Response) => {
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
});
export default router;
