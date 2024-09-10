import { Router, Request, Response, NextFunction } from "express";
import User from "../models/User";

const router = Router();

router.put("/update-asso", async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
    const { firstName, lastName, age, description, interests } = req.body;
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          firstName,
          lastName,
          age,
          description,
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

router.post ("/profilupdate", async (req: Request, res: Response) => {
  const userId = res.locals.user.userId;
  const { firstName, lastName, age, description, interests} = req.body;
  try {
    const postUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        age,
        description,
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

export default router;
