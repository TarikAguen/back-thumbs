import { Router, Request, Response, NextFunction } from "express";
import User from "../models/User";
import Interest from "../models/Interest";
import bcrypt from "bcrypt";

const router = Router();

router.put("/update-profil", async (req: Request, res: Response) => {
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
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        password: hashedPassword,
        lastName,
        birthdate,
        description,
        presentation,
        location,
        interests,
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
    res.status(500).send("Error updating user");
  }
});

router.post("/profilupdate", async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const {
    firstName,
    lastName,
    password,
    birthdate,
    description,
    presentation,
    interests,
    localisation,
  } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const postUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        password: hashedPassword,
        lastName,
        birthdate,
        location,
        description,
        presentation,
        interests,
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
    res.status(500).send("Error updating user");
  }
});
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
