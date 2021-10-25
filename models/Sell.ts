import {Schema} from "inspector";

const mongoose = require("mongoose");

interface Sell {
 name:string,
 sellerId:string,
 description:string,
 location:string,
}

// @ts-ignore
const schema = new mongoose.Schema <User> ({
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
    sellerId:{
        type:String,
        maxLength:200,
        required:true
    }
});
// @ts-ignore
let clientModel = mongoose.model<User>("sell", schema);
let exportObj = {
    clientModel,
    mongoose,
};
export default exportObj;
