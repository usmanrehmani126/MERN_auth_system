import express from "express";
import dotenv from "dotenv";

import connectDB from "./db/connectDB.js";
import authRoute from "./route/auth.route.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoute);

app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on ${process.env.PORT}`)
});
