import transationmodel from "../models/transactionModel.js";
import accountModel from "../models/accountModel.js";
async function transactionHistory(req,res){
    const { accountId } = req.params;
    const account = await accountModel.findById(accountId);
    if(!account) {
        return res.status(404).json({
            message:"account is not found",
            status: "failed"
        })
    }
    if(account.user.toString() !== req.user._id.toString()) {
       return res.status(403).json({
            message:"you cannot acess  directly",
            status:"failed"
        })
    }
    const transactions = await transationmodel
    .find({ account: accountId })
    .sort({ createdAt: -1 });
    res.status(200).json({
        message:"history is fetch sucessefully",
        transactions
    })
}
export default transactionHistory;