// controller/messageController.ts
import { Request, Response } from "express";
import Message from "../models/Message";
import User from "../models/User";
import Asso from "../models/Asso";
export const sendMessage = async (req: Request, res: Response) => {
  try {
    console.log("Received send message request:", req.body);
    const { senderId, receiverId, content } = req.body;

    console.log("Looking up sender and receiver in the database");

    // Tente de trouver l'expéditeur et le destinataire dans les utilisateurs ou les associations
    const sender =
      (await User.findById(senderId)) || (await Asso.findById(senderId));
    const receiver =
      (await User.findById(receiverId)) || (await Asso.findById(receiverId));

    if (!sender || !receiver) {
      console.log("Sender or receiver not found");
      return res.status(404).send({ message: "Sender or receiver not found" });
    }

    console.log("Creating message document");
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      sentAt: new Date(),
    });

    console.log("Saving message");
    await message.save();

    console.log("Message sent successfully");
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
