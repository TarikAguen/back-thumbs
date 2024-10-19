import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateJWT } from "./middleware/auth";
import authRoutes from "./routes/auth";
import authAssoRoutes from "./routes/auth-asso";
import profilRoutes from "./routes/profil";
import AssoRoutes from "./routes/asso";
import EventRoutes from "./routes/event";
import GeoRoutes from "./routes/geocode";
import { Server } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import messageRoutes from "./routes/message";
// import PasswordRoutes from "./routes/reset-password";
import { authenticateJWTAsso } from "./middleware/auth-asso";
dotenv.config();
const app: Express = express();
const server = new Server(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Permettre les requêtes depuis n'importe quelle origine
    methods: ["GET", "POST"],
  },
});
// Configuration de Socket.IO
io.on("connection", (socket: Socket) => {
  console.log("New client connected");

  const userId = socket.handshake.query.userId as string | undefined;

  if (userId) {
    socket.join(userId); // L'utilisateur rejoint une "room" basée sur son propre ID
    console.log(`User ${userId} joined their own room`);
  } else {
    console.log("No userId provided, cannot join private room");
  }

  // Recevoir un message depuis le frontend via Socket.IO
  socket.on("send_message", (data) => {
    const { senderId, receiverId, content } = data;

    // Envoyer le message aux deux utilisateurs via leur "room"
    io.to(senderId).emit("receive_message", { senderId, receiverId, content });
    io.to(receiverId).emit("receive_message", {
      senderId,
      receiverId,
      content,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
const PORT: string | number = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req: Request, res: Response) => {
  res.send("Api Thumbs");
});
app.use("/auth", authRoutes);
app.use("/auth-asso", authAssoRoutes);
app.use("/profil", authenticateJWT, profilRoutes);
app.use("/asso", authenticateJWTAsso, AssoRoutes);
app.use("/event", authenticateJWTAsso, EventRoutes);
app.use("/geo", authenticateJWT, GeoRoutes);
// app.use("/reset-password", PasswordRoutes);
app.use("/messages", authenticateJWT, messageRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
