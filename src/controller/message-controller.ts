// controller/messageController.ts
import { Request, Response } from "express";
import Message from "../models/Message";
import User from "../models/User";
import Asso from "../models/Asso";
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Tente de trouver l'expéditeur et le destinataire dans les utilisateurs ou les associations
    const sender =
      (await User.findById(senderId)) || (await Asso.findById(senderId));
    const receiver =
      (await User.findById(receiverId)) || (await Asso.findById(receiverId));
    const senderModel = sender instanceof User ? "User" : "Asso";
    const receiverModel = receiver instanceof User ? "User" : "Asso";

    if (!sender || !receiver) {
      return res.status(404).send({ message: "Sender or receiver not found" });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      sentAt: new Date(),
      onModel: senderModel, // ou receiverModel si vous voulez spécifier le destinataire
    });

    await message.save();
    res.status(200).send({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({ message: "Error sending message" });
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
