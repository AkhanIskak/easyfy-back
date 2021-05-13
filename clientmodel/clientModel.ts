const  mongoose = require('mongoose')

const UserModel =new mongoose.Schema({
    name:{
        type:String,
       
        maxlength:100,
        required:true
        
    },
    nickname:{
        type:String,
        maxlength:100,
        required:true
    },
    email:{
        type:String,
         unique:true,
        maxlength:100,
        required:true
    },

  password:{
      type:String,
      required:true,
  },
  pswRstCode:String,
  pswRstDate:Date,
  passwordChangedAt:Date,
  emailConfirm:{
      type:String,
  },
  emailConfirmed :{
      type:Boolean,
      default:false
  }  ,
  emailConfirmDate:Date,
 
  
})
let client = mongoose.model("clients",UserModel)
let exportObj = {
    client,
    mongoose
}
export default exportObj;