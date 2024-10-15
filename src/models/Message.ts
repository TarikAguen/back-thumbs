import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  senderId: Schema.Types.ObjectId;
  receiverId: Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, refPath: "onModel" },
  receiverId: { type: Schema.Types.ObjectId, refPath: "onModel" },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  onModel: {
    type: String,
    required: true,
    enum: ["User", "Asso"],
  },
});

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
