import mongoose, { Document, Schema } from "mongoose";

interface IAsso extends Document {
  type?: string;
  email: string;
  password: string;
  nameasso?: string;
  siret?: number;
  logo?: string;
  description?: string;
  presentation?: string;
  website?: string;
  telephone?: number;
  creationdate?: Date;
  city?: string;
  postalcode?: number;
  address?: string;
  interests?: string[];
}

const AssoSchema: Schema = new Schema(
  {
    type: { type: String, default: "asso" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nameasso: { type: String, required: true },
    siret: { type: Number, required: true },
    logo: { type: String, default: "placeholder" },
    telephone: { type: Number, required: true },
    description: { type: String },
    presentation: { type: String },
    website: { type: String },
    creationdate: { type: Date },
    interests: { type: [String] },
    city: { type: String, required: true },
    postalcode: { type: Number, required: true },
    address: { type: String, required: true },
  },
  { collection: "asso" }
);

const User = mongoose.model<IAsso>("Asso", AssoSchema);
export default User;
