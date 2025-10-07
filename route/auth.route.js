import express from "express";
import { register, verifyEmail } from "../controller/auth.controller.js";

const router = express.Router();


router.post("/register",register);

router.post("/verify-email",verifyEmail);

export default router;