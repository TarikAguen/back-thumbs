// controller/messageController.ts
import { Request, Response } from "express";
import Message from "../models/Message";
import User from "../models/User";
import Asso from "../models/Asso";
import mongoose from "mongoose";
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
        { sender: userId, receiver: currentUserId },
      ],
    }).populate("sender receiver", "email nameasso");

    res.json(messages);
  } catch (err) {
    console.error("Error retrieving messages:", err);
    res.status(500).send("Error retrieving messages");
  }
};

export const getConversationsWithLastMessage = async (
  req: Request,
  res: Response
) => {
  const currentUserId = res.locals.user?.userId; // Utiliser res.locals.user pour récupérer l'ID de l'utilisateur authentifié

  try {
    if (!currentUserId) {
      return res.status(401).send({ message: "Unauthorized access" });
    }

    // Agrégation pour obtenir les conversations avec le dernier message
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(currentUserId) },
            { receiver: new mongoose.Types.ObjectId(currentUserId) },
          ],
        },
      },
      {
        $sort: { sentAt: -1 }, // Trier par date (du plus récent au plus ancien)
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(currentUserId)] },
              "$receiver",
              "$sender",
            ], // Grouper par l'autre utilisateur
          },
          lastMessage: { $first: "$$ROOT" }, // Obtenir le dernier message pour chaque groupe
        },
      },
    ]);

    // Vérification si aucune conversation trouvée
    if (messages.length === 0) {
      return res.status(200).json({ message: "Aucune conversation trouvée." });
    }

    // Récupérer les informations des utilisateurs ou associations avec qui les conversations ont eu lieu
    const conversationIds = messages.map((msg) => msg._id);
    const users = await User.find({ _id: { $in: conversationIds } });
    const associations = await Asso.find({ _id: { $in: conversationIds } });

    // Fonction pour déterminer si la personne est un User ou une Asso
    const getPersonInfo = (person: any) => {
      if (person.firstName && person.lastName) {
        return {
          type: "user",
          name: `${person.firstName} ${person.lastName}`,
          photo: person.photo || null,
        };
      } else if (person.nameasso) {
        return {
          type: "asso",
          name: person.nameasso,
          photo: person.logo || null,
        };
      }
      return null;
    };

    // Fusionner les utilisateurs et les associations dans une seule liste
    const conversations = [...users, ...associations].map((person) => {
      const lastMessage = messages.find((msg) => msg._id === person._id);

      const personInfo = getPersonInfo(person);

      return {
        person: personInfo,
        lastMessage: lastMessage
          ? lastMessage.lastMessage.content
          : "Pas de message",
        sentAt: lastMessage ? lastMessage.lastMessage.sentAt : null,
      };
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error retrieving conversations:", error);
    res.status(500).send("Error retrieving conversations");
  }
};
