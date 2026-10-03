import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { sendWelcomeEmail } from "../lib/resend.js";
import { uploadImage } from "../lib/cloudinary.js";

const JWT_COOKIE_NAME = "jwt";
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days ms

/** Helper to generate JWT */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/** Set JWT cookie */
const setTokenCookie = (res, token) => {
  res.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: JWT_EXPIRES_IN,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, fullName });
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, fullName).catch((err) =>
      console.error("Email error:", err.message)
    );

    const { passwordHash: _, ...userData } = user.toObject();
    res.status(201).json({ user: userData });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    const { passwordHash: _, ...userData } = user.toObject();
    res.json({ user: userData });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie(JWT_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out" });
};

export const check = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("check error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    let avatarUrl;
    if (req.file) {
      avatarUrl = await uploadImage(req.file.buffer);
    }
    const updates = {};
    if (req.body.fullName) updates.fullName = req.body.fullName;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-passwordHash");
    res.json({ user });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
