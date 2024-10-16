import mongoose, { Document, Schema } from "mongoose";

interface IMessage extends Document {
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  content: string;
  sentAt: Date;
  onModel: string; // Indique le modèle du sender ou receiver
}

const messageSchema: Schema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "onModel",
  },
  receiver: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "onModel",
  },
  content: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  onModel: {
    type: String,
    required: true,
    enum: ["User", "Asso"],
  },
});

const Message = mongoose.model<IMessage>("Message", messageSchema);
export default Message;
