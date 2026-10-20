
import mongoose from "mongoose";

async function connectionDB() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(mongoURI);

    console.log("Database connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

export default connectionDB;
