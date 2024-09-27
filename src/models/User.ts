import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  birthdate?: Date;  // Date de naissance
  age?: number;  // Calculé automatiquement
  interests?: string[];
  photo?: string;
  genre?: 'homme' | 'femme' | 'autre';
  location?: string;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  birthdate: { type: Date, required: true },  // Date de naissance obligatoire
  description: { type: String },
  interests: { type: [String] },
  photo: { type: String },
  genre: { type: String, enum: ['homme', 'femme', 'autre'] },
  location: { type: String }
}, {
  collection: "users",
  toJSON: { virtuals: true },  // Inclure les virtuals dans JSON
  toObject: { virtuals: true }
});

// Ajout d'un champ virtuel pour calculer l'âge automatiquement
UserSchema.virtual('age').get(function () {
  if (this.birthdate instanceof Date) {  // Vérification que birthdate est une instance de Date
    const ageDifMs = Date.now() - this.birthdate.getTime();
    const ageDate = new Date(ageDifMs); 
    return Math.abs(ageDate.getUTCFullYear() - 1970);  // Calcul de l'âge
  }
  return null;
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
