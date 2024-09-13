import mongoose, { Document, Schema } from "mongoose";

interface IEvent extends Document {
  eventName?: string;
  organisator?: string;
  description?: string;
  subdescription?: string;
  participants?: string[];
  interests?: string[];
}

const EventSchema: Schema = new Schema(
  {
    eventName: { type: String, required: true },
    organisator: { type: String, required: true},
    description: { type: String, required: true },
    subdescription: { type: String },
    participants: { type: [String] },
    interests: { type: [String] },
  },
  { collection: "event" }
);

const User = mongoose.model<IEvent>("Event", EventSchema);
export default User;
