import { Schema } from "inspector";
import mongoose from "mongoose";

interface User {
  _id: string;
  name: string;
  phoneNumber: string;
  nickname: string;
  email: string;
  password: string;
  pswRstCode: string;
  pswRstDate: Date;
  passwordChangedAt: number;
  emailConfirm: string;
  emailConfirmed: boolean;
  emailConfirmDate: Date;
  from: any[];
  to: any[];
  about: string;
}

// @ts-ignore
const schema: User = new mongoose.Schema<User>({
  name: {
    type: String,
    maxlength: 100,
    required: true,
  },
  phoneNumber: {
    type: String,
    maxlength: 15,
    required: true,
  },
  nickname: {
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

  password: {
    type: String,
    required: true,
  },
  pswRstCode: String,
  pswRstDate: Date,
  passwordChangedAt: Number,
  emailConfirm: {
    type: String,
  },
  emailConfirmed: {
    type: Boolean,
    default: false,
  },
  emailConfirmDate: Date,
  from: {
    type: Array,
  },
  to: {
    type: Array,
  },
  about: {
    type: String,
  },
});
// @ts-ignore
const clientModel = mongoose.model<User>("clients", schema);
const exportObj = {
  clientModel,
  mongoose,
};
export default exportObj;
