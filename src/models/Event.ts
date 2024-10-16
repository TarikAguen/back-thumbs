import mongoose, { Document, Schema } from "mongoose";

interface IParticipant {
  id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
}

interface IEvent extends Document {
  type?: string;
  eventName?: string;
  organisator?: string;
  description?: string;
  subdescription?: string;
  photo?: string;
  city?: string;
  postalcode?: number;
  creationdate?: Date;
  address?: string;
  participants?: IParticipant[];
  interests?: string[];
  location: {
    type: { type: String; enum: ["Point"]; default: "Point" };
    coordinates: { type: [Number]; index: "2dsphere" }; // Longitude (E/W), Latitude (N/S)
  };
}

const EventSchema: Schema = new Schema(
  {
    type: { type: String, default: "event" },
    eventName: { type: String, required: true },
    organisator: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, required: true },
    city: { type: String },
    postalcode: { type: Number },
    address: { type: String },
    subdescription: { type: String },
    creationdate: { type: Date, required: true },
    participants: {
      type: [
        {
          id: { type: Schema.Types.ObjectId, ref: "User" },
          firstName: { type: String },
          lastName: { type: String },
        },
      ],
      default: [],
    },
    interests: { type: [String] },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // Important pour les requêtes géospatiales
    },
  },
  { collection: "event" }
);

const Event = mongoose.model<IEvent>("Event", EventSchema);
export default Event;
