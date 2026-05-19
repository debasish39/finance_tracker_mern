import mongoose from "mongoose";
const transactionSchema= new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    type:{
        type:String,
        enum:["income","expense"],
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        required:true,
    },
},
{
    timestamps:true,
});
const Transaction=mongoose.model("Transaction",transactionSchema);
export default Transaction;