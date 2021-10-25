import { Schema } from "inspector";
import mongoose from "mongoose";

interface Sell {
  _id:string,
  name: string;
  sellerId: string;
  description: string;
  location: string;
}

// @ts-ignore
const schema = new mongoose.Schema<Sell>({
  name: {
    type: String,
    maxlength: 100,
    required: true,
  },

  email: {
    type: String,
    unique: false,
    maxlength: 100,
    required: true,
  },
  sellerId: {
    type: String,
    maxLength: 200,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});
// @ts-ignore
let sellModel = mongoose.model<Sell>("sell", schema);
export default sellModel;
