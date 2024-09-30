import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { authenticateJWT } from "./middleware/auth";
import authRoutes, { checkRevokedToken } from "./routes/auth";
import profilRoutes from "./routes/profil";
dotenv.config();
const app: Express = express();
const PORT: string | number = process.env.PORT || 3001;
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req: Request, res: Response) => {
  res.send("Wesh le sang!");
});
app.use("/auth", authRoutes);
app.use(express.json());
app.use("/profil", authenticateJWT, profilRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
