import mongoose, { Document, Schema } from "mongoose";

interface IAsso extends Document {
  email: string;
  password: string;
  nameasso?: string;
  siret?: number;
  logo?: string;
  description?: string;
  presentation?: string;
  website?: string;
  telephone?: number;
  location?: string;
  creationdate?: Date;
  interests?: string[];
}

const AssoSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nameasso: { type: String, required: true },
    siret: { type: Number, required: true },
    logo: { type: String },
    location: { type: String, required: true },
    telephone: { type: Number, required: true },
    description: { type: String },
    presentation: { type: String },
    website: { type: String },
    creationdate: { type: Date },
    interests: { type: [String] },
  },
  { collection: "asso" }
);

const User = mongoose.model<IAsso>("Asso", AssoSchema);
export default User;
