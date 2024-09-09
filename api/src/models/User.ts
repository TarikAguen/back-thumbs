import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  interests?: string[];
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    age: { type: Number },
    description: { type: String },
    interests: { type: [String] },
  },
  { collection: "users" }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
