import mongoose from "mongoose";

const transationSchema = new mongoose.Schema({
    account : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "account",
    },
    senderAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account"
    },
    receiverAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account"
    },
    type : {
        type : String,
        required: [true, "Transaction type is required"],
        enum: ["DEPOSIT", "WITHDRAWAL", "TRANSFER"]

    },
    amount : {
        type : Number,
        required : [true,"amount is require"],
        min : [0.01,"Amount must be greater than zero"]
    },
    status: {
        type : String,
        enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "PENDING"
    },
    description:{
        type : String,
        trim: true

    }
}, {
    timestamps : true
}
);

const transationmodel = mongoose.model("transaction",transationSchema);

export default transationmodel;