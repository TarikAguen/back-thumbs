import { Router } from "express";
import {
  sendMessage,
  getMessages,
  getConversationsWithLastMessage,
} from "../controller/message-controller";

const router = Router();

router.post("/send", sendMessage);
router.get("/get/:userId", getMessages);

// Nouvelle route pour récupérer les conversations
router.get("/conversations", getConversationsWithLastMessage);

export default router;
