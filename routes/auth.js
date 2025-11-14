import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// ✅ Registration
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({ email, passwordHash });
    const saved = await newUser.save();

    const token = jwt.sign({ _id: saved._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: { _id: saved._id, email: saved.email },
    });
  } catch {
    res.status(500).json({ message: "Registration error" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exist = await User.findOne({ email });
    if (!exist) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, exist.passwordHash);
    if (!isValid)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ _id: exist._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      token,
      user: { _id: exist._id, email: exist.email },
    });
  } catch {
    res.status(500).json({ message: "Login error" });
  }
});

// ✅ Check auth
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);
    res.json({ user });
  } catch {
    res.status(403).json({ message: "No access" });
  }
});

export default router;
