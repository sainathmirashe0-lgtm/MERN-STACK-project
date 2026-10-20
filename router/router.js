import express from 'express';
import authUser from './authUser.js';
import accountModel from '../models/accountModel.js';
import accountRouters from "./accountRoutes.js";
import transactionRoutes from "./transactionRoute.js";
import transactionHistory from './transactionHistoryRoute.js';
const router = express.Router();

router.use("/api/auth", authUser);
router.use("/api/account",accountRouters);
router.use("/api/transaction",transactionRoutes);
router.use("/api/history",transactionHistory);
export default router;