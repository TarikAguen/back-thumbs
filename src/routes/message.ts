import { Router } from "express";
import {
  sendMessage,
  getMessages,
  getConversations,
} from "../controller/message-controller";

const router = Router();

router.post("/send", sendMessage);
router.get("/get/:userId", getMessages);

// Nouvelle route pour récupérer les conversations
router.get("/conversations", getConversations);

export default router;
