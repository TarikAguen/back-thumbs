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
  telephone?: string;
  creationdate?: Date;
  city?: string;
  postalcode?: number;
  address?: string;
  interests?: string[];
  location: {
    type: { type: String; enum: ["Point"]; default: "Point" };
    coordinates: { type: [number]; index: "2dsphere" }; // Longitude (E/W), Latitude (N/S)
  };
}

const AssoSchema: Schema = new Schema(
  {
    type: { type: String, default: "asso" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nameasso: { type: String, required: true },
    siret: { type: Number, required: true },
    logo: { type: String, default: "placeholder" },
    telephone: { type: String, required: true },
    creationdate: { type: Date, required: true },
    interests: { type: [String], required: true },
    city: { type: String, required: true },
    postalcode: { type: Number, required: true },
    address: { type: String, required: true },
    description: { type: String },
    presentation: { type: String },
    website: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // Longitude (E/W), Latitude (N/S)
    },
  },
  { collection: "asso" }
);

const Asso = mongoose.model<IAsso>("Asso", AssoSchema);
export default Asso;
