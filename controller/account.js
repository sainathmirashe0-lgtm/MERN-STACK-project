import accountModel from "../models/accountModel.js";


async function createAccountController(req,res) {
    try {
    const user = req.user;
    const { account: accountType } = req.body;
    const allowedTypes = ["Saving", "Current", "Bussiness"];

    if (!allowedTypes.includes(accountType)) {
      return res.status(400).json({
        message: "Please select a valid account type",
      });
    }

    

    const account1 = await accountModel.findOne({
        user: user._id
    })
     if (account1) {
      return res.status(409).json({
        message: "You already have an account",
        account: account1,
      });
    }
   const account = await accountModel.create({
      user: user._id,
      account: accountType,
    });
    res.status(201).json({
        account,
         user: {
                name: user.name,
                email: user.email
            },
    })
   
   } catch (error) {
    console.error("Account creation error:", error);

    return res.status(500).json({
      message: "Failed to create account",
    });
  }

}
async function getAccount(req,res) {
    try  {
        const account = await accountModel.findOne({
         user: req.user._id
    })
     
    if(!account) {
        return res.status(404).json({message:"Acount is not found",status:"failed"})
    }
    return res.status(200).json({ account });
}
 catch (error) {
    console.error("fail to create:", error)
    return res.status(500).json({message:"failed to fetch account",status:"failed"})
 }
}
export default {
    createAccountController,
     getAccount
}; 