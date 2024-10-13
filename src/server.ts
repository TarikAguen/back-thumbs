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
import { authenticateJWTAsso } from "./middleware/auth-asso";
dotenv.config();
const app: Express = express();
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
app.use("/geo", authenticateJWTAsso, GeoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
