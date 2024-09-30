import AWS from "aws-sdk";
import fs from "fs";
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
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req: Request, res: Response) => {
  res.send("Wesh le sang!");
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const fileContent = fs.readFileSync("../toz.png");
  const params = {
    Bucket: "photo-thumb-mt22",
    Key: "test-upload.png",
    Body: fileContent,
    ACL: "public-read",
  };

  s3.upload(params, (err: any, data: any) => {
    if (err) {
      console.error("Erreur lors de l'upload S3 :", err);
      return;
    }
    console.log(`Fichier uploadé avec succès à ${data.Location}`);
  });
});
app.use("/auth", authRoutes);
app.use("/profil", authenticateJWT, profilRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
