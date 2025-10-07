import express from "express";
import dotenv from "dotenv";

import connectDB from "./db/connectDB.js";
import authRoute from "./route/auth.route.js";

dotenv.config();

const app = express();


app.use(express.json());
app.use("/api/auth", authRoute);

app.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server is running on ${process.env.PORT}`)
});
