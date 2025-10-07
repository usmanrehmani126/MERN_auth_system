import bcryptjs from "bcrypt";

import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utlis/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/emails.js";

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
      return res
        .status(400)
        .json({
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
    const token=generateTokenAndSetCookie(res, newUser._id);
    await sendVerificationEmail(newUser.email, verificationToken);
    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" ,user:{
        ...newUser._doc,
        token,
        password:undefined
      }});
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

