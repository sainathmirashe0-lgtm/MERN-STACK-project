import express from "express";
import cors from 'cors';
import router from "./router/router.js";
import userSchema from "./models/Student.js";
import connectionDB from "./db.js";
import cookieParser from "cookie-parser";
connectionDB()
const app = express();
app.use(cors({
  origin: 'http://localhost:5173'
}));


app.use(cookieParser())
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/",router)

