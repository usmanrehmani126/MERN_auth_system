import express from "express";

import { forgotPassword, login, logout, register, verifyEmail } from "../controller/auth.controller.js";

const router = express.Router();


router.post("/register",register);

router.post("/verify-email",verifyEmail);

router.post("/login",login);

router.post("/logout",logout);

router.post("/forgot-password",forgotPassword);

export default router;