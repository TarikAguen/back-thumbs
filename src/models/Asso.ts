import mongoose, { Document, Schema } from "mongoose";

interface IAsso extends Document {
  email: string;
  password: string;
  Name?: string;
  siret?: string;
  description?: string;
  interests?: string[];
}

const AssoSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    Name: { type: String },
    siret: { type: String },
    description: { type: String },
    interests: { type: [String] },
  },
  { collection: "asso" }
);

const User = mongoose.model<IAsso>("Asso", AssoSchema);
export default User;
