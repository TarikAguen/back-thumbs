import { Router, Request, Response, NextFunction } from "express";
import Asso from "../models/Asso";

const router = Router();

router.put("/update-asso", async (req: Request, res: Response) => {
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
    location,
    creationdate,
    interests,
  } = req.body;

  try {
    const updatedUser = await Asso.findByIdAndUpdate(
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
        location,
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
});

router.post("/profilupdate", async (req: Request, res: Response) => {
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
    location,
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
        location,
        creationdate,
        interests,
      },
      { new: true }
    );

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
});

export default router;
