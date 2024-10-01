import mongoose, { Document, Schema } from "mongoose";

interface IParticipant {
  id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
}

interface IEvent extends Document {
  eventName?: string;
  organisator?: string;
  description?: string;
  subdescription?: string;
  photo?: string;
  city?: string;
  postalcode?: number;
  adress?: string;
  participants?: IParticipant[];
  interests?: string[];
}

const EventSchema: Schema = new Schema(
  {
    eventName: { type: String, required: true },
    organisator: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String },
    city: { type: String },
    postalcode: { type: Number },
    adress: { type: String },
    subdescription: { type: String },
    participants: {
      type: [
        {
          id: { type: Schema.Types.ObjectId, ref: "User", required: true },
          firstName: { type: String, required: true },
          lastName: { type: String, required: true },
        },
      ],
      default: [],
    },
    interests: { type: [String] },
  },
  { collection: "event" }
);

const Event = mongoose.model<IEvent>("Event", EventSchema);
export default Event;
