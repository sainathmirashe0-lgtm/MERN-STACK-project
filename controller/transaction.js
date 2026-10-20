import mongoose from "mongoose";
import accountModel from "../models/accountModel.js";
import transationmodel from "../models/transactionModel.js";

async function transaction(req,res) {
      let session;
 try {

         const {accountId,amount,type,description} = req.body;

         if(amount <= 0) {
         return res.status(400).json({ message:"invalid amount",status:"failed" });
         }
         if( typeof amount !== "number" || !Number.isFinite(amount)) {
            return res.status(400).json({ message:"invalid amount enter valid number",status:"failed" });
         }
         const account = await accountModel.findById(accountId);

         if(!account) {
            return res.status(404).json({
               message: "Acount is not found", status:"failed"
            });
         }
          if(account.user.toString() !== req.user._id.toString()){
            return res.status(403).json({
               message:"You are not authorized to access this account",
               status : "failed"
            });
         }
         if(account.status !== "ACTIVE") {
            return res.status(400).json({message:"Please Activate your account",status:"failed"});
         }
         if(!["DEPOSIT","WITHDRAWAL"].includes(type)) {
            return res.status(400).json({message:"Please Select either Deposite or Withdrawal",status:"failed"});
         }

         session = await mongoose.startSession();
         session.startTransaction();

         if(type === "WITHDRAWAL" && amount >account.balance) {
            await session.abortTransaction();
            return res.status(400).json({
               message : "Insufficient balance",
               status: "failed"
            })
         }
         if(type === "DEPOSIT") {
            account.balance += amount;
            await account.save({ session });
         }
         if(type === "WITHDRAWAL") {
            account.balance -= amount;
            await account.save({ session });
         }
         
        

   const [newTransaction] = await transationmodel.create(
       [{
        account: account._id,
        amount,
        type,
        status: "COMPLETED",
        description
    }],
    { session }
);
await session.commitTransaction();
         return res.status(201).json({
            message: "Transaction successful",
            account,
            transaction: newTransaction
         });
         
         
         }

       
catch (error) {
    console.error("Transaction error:", error);

    if (session?.inTransaction()) {
        try {
            await session.abortTransaction();
        } catch (abortError) {
            console.error("Abort error:", abortError);
        }
    }

    return res.status(500).json({
        message: "Transaction failed",
        error: error.message
    });
}
finally{
  if (session) {
    await session.endSession();
}
}
}
async function moneyTransfer(req,res) {
  let session;
   try {
   
  const {toaccountId, formaccountId, amount, type, description} = req.body;
    
  if( typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
   return res.status(400).json({message:"Enter a valid number",status:"failed"});
  }
 
   if (
      !mongoose.isValidObjectId(toaccountId) ||
      !mongoose.isValidObjectId(formaccountId)
   ) {
      return res.status(400).json({
         message: "Invalid account ID",
         status: "failed"
      });
   }
  const receiverAccount = await accountModel.findById(toaccountId);

  const senderAccount = await accountModel.findById(formaccountId);

  if(String(toaccountId) === String(formaccountId)) {
    return res.status(400).json({
      message:"you cannot tranfer money in same account",
      status:"failed"
   });
}
  if(!senderAccount) {
   return res.status(404).json({message:"Sender account is not found",status:"failed"});
  }

   if(!receiverAccount) {
   return res.status(404).json({message:"receiver account is not found",status:"failed"});
  }

  if(senderAccount.user.toString()!== req.user._id.toString()) {
   return res.status(401).json({message:"you are not authorise user",status:"failed"});
  }

  if(senderAccount.status !== "ACTIVE" || receiverAccount.status !== "ACTIVE") {
    return res.status(401).json({message:"you are Acount is not Active plz Active Your Acount",status:"failed"});
  }
  if(!["TRANSFER"].includes(type)) {
            return res.status(400).json({message:"Please Select transfer",status:"failed"});
         }
    session = await mongoose.startSession();
    session.startTransaction();


  if(type === "TRANSFER" && amount > senderAccount.balance) {
    await session.abortTransaction();
   return res.status(400).json( {message : "Insuffisant balance",status:"failed" })
  }
  if(type === "TRANSFER") {
   senderAccount.balance -= amount;
   await senderAccount.save({ session });
  }
  if(type === "TRANSFER") {
   
   receiverAccount.balance += amount;
   
   await receiverAccount.save({ session });
  }
   
 
const [newTransaction] = await transationmodel.create(
       [{
        senderAccount: senderAccount._id,
        receiverAccount: receiverAccount._id,
        amount,
        type,
        status: "COMPLETED",
        description
    }],
    { session }
);

await session.commitTransaction();

return res.status(201).json({
            message: "Transaction successful",
            senderAccount,
            receiverAccount,
            transaction: newTransaction
         });
} catch (error) {
    console.error("Transaction error:", error);

    if (session?.inTransaction()) {
        try {
            await session.abortTransaction();
        } catch (abortError) {
            console.error("Abort error:", abortError);
        }
    }

    return res.status(500).json({
        message: "Transaction failed",
        error: error.message
    });
}
finally{
  if (session) {
    await session.endSession();
}
}
}
export default { transaction , moneyTransfer };