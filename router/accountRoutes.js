import mongoose from "mongoose";
import express from "express";
import account from "../controller/account.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

// router.post("api/auth/account",(req,res)=>{

// })
router.post("/",authMiddleware,account.createAccountController)
router.get("/me",authMiddleware,account.getAccount)

export default router