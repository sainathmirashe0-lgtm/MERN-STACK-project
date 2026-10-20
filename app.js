
import express from "express";
import cors from "cors";
import router from "./router/router.js";
import connectionDB from "./db.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // Add your deployed frontend URL here
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

async function startServer() {
  try {
    await connectionDB();

    app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
      console.log(
        `Server running on port ${process.env.PORT || 3000}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
