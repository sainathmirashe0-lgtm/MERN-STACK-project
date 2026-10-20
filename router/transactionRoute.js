import express from "express";
import transactions from "../controller/transaction.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', authMiddleware,transactions.transaction);
router.post('/moneyTransfer', authMiddleware,transactions.moneyTransfer);

export default router;