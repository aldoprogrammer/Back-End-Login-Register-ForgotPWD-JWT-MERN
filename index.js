import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { UserRouter } from "./routes/user.js";
dotenv.config()
const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL
console.log("FRONTEND_URL:", FRONTEND_URL);

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', UserRouter)

const mongodbUri = process.env.MONGODB_URI;
mongoose.connect(mongodbUri)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});