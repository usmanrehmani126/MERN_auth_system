import bcryptjs from "bcrypt";
import crypto from "crypto";

import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utlis/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const isEmailExists = await User.findOne({ email: email });
    if (isEmailExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashPassword = await bcryptjs.hash(password, 10);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await newUser.save();
    const token = generateTokenAndSetCookie(res, newUser._id);
    await sendVerificationEmail(newUser.email, verificationToken);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        ...newUser._doc,
        token,
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
    await sendWelcomeEmail(user.email, user.name);
    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (_, res) => {
  try {
    res.clearCookie("token");
    return res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email not verified" });
    }
    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = Date.now();
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "User logged in successfully" });
  } catch (error) {}
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email, "EMAIL");
  try {
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    const resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;

    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.FRONTEND_DOMAIN}/reset-password/${resetToken}`
    );
    return res
      .status(200)
      .json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }
    const hashPassword = await bcryptjs.hash(password, 10);
    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    await sendPasswordResetEmail(user.email, "Password reset successfully");
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
