import mongoose, { Document, Schema } from "mongoose";

interface IInterestItem {
  id: number;
  nom: string;
  thematique: string;
}

interface IInterest extends Document {
  centres_interets: IInterestItem[];
}

const InterestSchema: Schema = new Schema({
  centres_interets: [
    {
      id: { type: Number, required: true },
      nom: { type: String, required: true },
      thematique: { type: String, required: true }
    }
  ]
}, {
  collection: "interests"
});

const Interest = mongoose.model<IInterest>("Interest", InterestSchema);
export default Interest;
