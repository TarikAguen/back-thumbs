// controller/messageController.ts
import { Request, Response } from "express";
import Message from "../models/Message";
import User from "../models/User";
import Asso from "../models/Asso";
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content } = req.body;

    console.log("Received senderId:", senderId);
    console.log("Received receiverId:", receiverId);

    // Tente de trouver l'expéditeur et le destinataire dans les utilisateurs ou les associations
    let sender = await User.findById(senderId);
    if (!sender) {
      sender = await Asso.findById(senderId);
    }
    console.log("Sender found:", sender);

    let receiver = await User.findById(receiverId);
    if (!receiver) {
      receiver = await Asso.findById(receiverId);
    }
    console.log("Receiver found:", receiver);

    if (!sender || !receiver) {
      return res.status(404).send({
        message: `Sender or receiver not found - Sender: ${sender}, Receiver: ${receiver}`,
      });
    }

    const senderModel = sender instanceof User ? "User" : "Asso";
    const receiverModel = receiver instanceof User ? "User" : "Asso";

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      sentAt: new Date(),
      onModel: senderModel, // ou receiverModel si vous voulez spécifier le destinataire
    });

    const savedMessage = await message.save();

    req.app.get("io").emit("receive_message", {
      senderId,
      receiverId,
      content,
      messageId: savedMessage._id,
      sentAt: savedMessage.sentAt,
    });

    res.status(200).send({
      message: "Message sent successfully",
      messageId: savedMessage._id,
    });
  } catch (err: any) {
    console.error("Error sending message:", err);
    res.status(500).send({ message: "Error sending message", err });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const currentUserId = res.locals.user?.userId; // Utiliser res.locals.user pour récupérer l'ID de l'utilisateur authentifié
  const { userId } = req.params; // ID du contact avec qui l'utilisateur est en conversation

  try {
    if (!currentUserId) {
      return res.status(401).send({ message: "Unauthorized access" });
    }

    // Récupérer seulement les messages où l'utilisateur authentifié est impliqué
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ],
    }).populate("sender receiver", "email nameasso");

    res.json(messages);
  } catch (err) {
    console.error("Error retrieving messages:", err);
    res.status(500).send("Error retrieving messages");
  }
};

};
