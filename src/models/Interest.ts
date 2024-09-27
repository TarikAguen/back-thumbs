import mongoose, { Document, Schema } from "mongoose";

interface IInterest extends Document {
  nom: string;
  thematique: string;
}


const InterestSchema: Schema = new Schema({
  nom: { type: String, required: true },
  thematique: { type: String, required: true }
}, {
  collection: "interests"
});

const Interest = mongoose.model<IInterest>("Interest", InterestSchema);
export default Interest;
