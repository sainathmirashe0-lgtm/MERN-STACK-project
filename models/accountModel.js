import mongoose from "mongoose";


const accountSchema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : [true,"account is associtive with login users"],
        index:true
    },
    status : {
     type :String,
      enum:{
        values : ["ACTIVE","FROZEN","CLOSED"],
        message : "Status can be either ACTIVE,FROZEN or CLOSED",
      },
      default: "ACTIVE"
    },
    currency : {
        type :String,
        required: [true,"Currency is required for creating account"],
        default:"INR"
    },
    account : {
        type : String,
        enum : {
            values : ["Saving","Current", "Bussiness"],
        },
        default : "Saving",
    },
    balance : {
        type : Number,
        default:0,
        min:0,
    },
     
        },
        {
            timestamps:true
        },
    );
accountSchema.index({user:1,status:1})
const accountModel = mongoose.model("account",accountSchema);

export default accountModel;