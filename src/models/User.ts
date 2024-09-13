import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  age?: number;
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
  age: { type: Number },
  description: { type: String },
  interests: { type: [String] },
  photo: { type: String },
  genre: { type: String, enum: ['homme', 'femme', 'autre'] },
  location: { type: String }
}, {
  collection: "users"
});


const User = mongoose.model<IUser>("User", UserSchema);
export default User;
