// controller/messageController.ts
import { Request, Response } from "express";
import Message from "../models/Message";
import User from "../models/User";
import Asso from "../models/Asso";

export const sendMessage = async (req: Request, res: Response) => {
  const { senderId, receiverId, content } = req.body;

  try {
    // Trouver le sender pour obtenir le type
    const sender =
      (await User.findById(senderId)) || (await Asso.findById(senderId));
    const receiver =
      (await User.findById(receiverId)) || (await Asso.findById(receiverId));

    if (!sender || !receiver) {
      return res.status(404).send("Sender or Receiver not found");
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      content,
      onModel: sender.type, // Utilisation du champ 'type' pour définir la collection de référence
    });

    await newMessage.save();
    res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending message");
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).populate("senderId receiverId", "email nameasso");

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving messages");
  }
};
