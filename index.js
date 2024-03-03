import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { UserRouter } from "./routes/user.js";

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL;
console.log("FRONTEND_URL:", FRONTEND_URL);

// Set up CORS to allow requests only from a specific origin
const corsOptions = {
  origin: FRONTEND_URL, // Change this to the specific origin you want to allow
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use('/auth', UserRouter);

const mongodbUri = process.env.MONGODB_URI;
mongoose.connect(mongodbUri)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
