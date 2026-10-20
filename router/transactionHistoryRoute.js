import express from "express";
import transactionHistory from "../controller/transactionHistory.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:accountId", authMiddleware,transactionHistory);

export default router;

