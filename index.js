import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config()
const app = express();

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});