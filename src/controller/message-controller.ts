// controller/messageController.ts
import { Request, Response } from "express";
import Message from "../models/Message";
import User from "../models/User";
import Asso from "../models/Asso";
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Tente de trouver l'expéditeur et le destinataire dans les utilisateurs ou les associations
    // const sender =
    //   (await User.findById(senderId)) || (await Asso.findById(senderId));
    // const receiver =
    //   (await User.findById(receiverId)) || (await Asso.findById(receiverId));
    let sender;
    let receiver;
    sender = await User.findById(senderId);
    if (!sender) {
      sender = await Asso.findById(senderId);
    }
    receiver = await User.findById(receiverId);
    if (!receiver) {
      receiver = await Asso.findById(receiverId);
    }

    const senderModel = sender instanceof User ? "User" : "Asso";
    const receiverModel = receiver instanceof User ? "User" : "Asso";
    if (!sender || !receiver) {
      return res.status(404).send({
        message:
          "Sender or receiver not found" +
          sender +
          receiver +
          senderId +
          receiverId,
      });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      sentAt: new Date(),
      onModel: senderModel, // ou receiverModel si vous voulez spécifier le destinataire
    });

    const savedMessage = await message.save();
    // Envoi du message via Socket.io
    req.app.get("io").emit("receive_message", {
      senderId,
      receiverId,
      content,
      messageId: savedMessage._id, // transmet l'ID du message pour référence future
      sentAt: savedMessage.sentAt,
    });

    res.status(200).send({
      message: "Message sent successfully",
      messageId: savedMessage._id,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send({ message: "Error sending message", error });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).populate("sender receiver", "email nameasso");

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving messages");
  }
};
