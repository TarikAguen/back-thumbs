import mongoose, { Document, Schema } from "mongoose";

interface IAsso extends Document {
  email: string;
  password: string;
  nameasso?: string;
  siret?: string;
  logo?: string;
  description?: string;
  website?: string;
  telephone?: string;
  location?: string;
  creationdate?: string;
  interests?: string[];
}

const AssoSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nameasso: { type: String, required: true },
    siret: { type: String, required: true },
    logo: { type: String },
    location: { type: String, required: true },
    telephone: { type: String, required: true },
    description: { type: String },
    website: { type: Date },
    creationdate: { type: String },
    interests: { type: [String] },
  },
  { collection: "asso" }
);

const User = mongoose.model<IAsso>("Asso", AssoSchema);
export default User;
