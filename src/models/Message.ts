// models/Message.ts
import mongoose, { Document, Schema } from "mongoose";

interface IMessage extends Document {
  senderId: Schema.Types.ObjectId;
  senderProfileType: string;
  receiverId: Schema.Types.ObjectId;
  receiverProfileType: string;
  message: string;
  createdAt: Date;
}

const messageSchema: Schema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "senderProfileType",
  },
  senderProfileType: { type: String, required: true, enum: ["User", "Asso"] },
  receiverId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "receiverProfileType",
  },
  receiverProfileType: { type: String, required: true, enum: ["User", "Asso"] },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;
