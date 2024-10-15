// controller/messageController.ts
import { Request, Response } from "express";
import Message from "../models/Message";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      senderId,
      senderProfileType,
      receiverId,
      receiverProfileType,
      message,
    } = req.body;
    const newMessage = new Message({
      senderId,
      senderProfileType,
      receiverId,
      receiverProfileType,
      message,
    });
    await newMessage.save();
    res
      .status(201)
      .json({ message: "Message sent successfully", data: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send message");
  }
};

export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { senderId, receiverId } = req.query;
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to get messages");
  }
};
