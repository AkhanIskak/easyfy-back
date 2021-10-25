import {Schema} from "inspector";
import mongoose from "mongoose";

interface User {
    _id:string,
    name: string,
    phoneNumber: string,
    nickname: string,
    email: string,
    password: string,
    pswRstCode: string,
    pswRstDate: Date,
    passwordChangedAt: Number,
    emailConfirm: string,
    emailConfirmed: boolean
    emailConfirmDate: Date,
}

// @ts-ignore
const schema = new mongoose.Schema <User> ({
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
});
// @ts-ignore
let clientModel = mongoose.model<User>("clients", schema);
let exportObj = {
    clientModel,
    mongoose,
};
export default exportObj;
