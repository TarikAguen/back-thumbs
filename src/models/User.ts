import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  type?: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  presentation?: string;
  birthdate?: Date; // Date de naissance
  age?: number; // Calculé automatiquement
  interests?: string[];
  photo?: string;
  genre?: "homme" | "femme" | "autre";
  city?: string;
  postalcode?: number;
  adress?: string;
  location: {
    type: { type: String; enum: ["Point"]; default: "Point" };
    coordinates: { type: [Number]; index: "2dsphere" }; // Longitude (E/W), Latitude (N/S)
  };
}

const UserSchema: Schema = new Schema(
  {
    type: { type: String, default: "user" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthdate: { type: Date, required: true },
    description: { type: String, required: true },
    presentation: { type: String, default: "" },
    interests: { type: [String] },
    photo: { type: String },
    genre: { type: String, enum: ["homme", "femme", "autre"] },
    city: { type: String, required: true },
    postalcode: { type: Number, required: true },
    adress: { type: String, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // Important pour les requêtes géospatiales
    },
  },
  {
    collection: "users",
    toJSON: { virtuals: true }, // Inclure les virtuals dans JSON
    toObject: { virtuals: true },
  }
);

// ajout d'un champ virtuel age, calculé auto par rapport à la date du j
UserSchema.virtual("age").get(function () {
  if (this.birthdate instanceof Date) {
    const ageDifMs = Date.now() - this.birthdate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
  return null;
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
