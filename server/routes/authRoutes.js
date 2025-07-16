const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const verifyAuth = require("../middleware/verifyAuth");

const router = express.Router();

// ✅ Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ required for admin checks
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found with that email" });

    const token = crypto.randomBytes(20).toString("hex");
    const expire = Date.now() + 15 * 60 * 1000;

    user.resetToken = token;
    user.resetTokenExpire = expire;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;


    const mailOptions = {
      from: `ScholarCamp <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.name || "user"},</p>
        <p>You requested a password reset. Click below to reset:</p>
        <a href="${resetUrl}" style="color: blue;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset email sent. Check your inbox." });
  } catch (err) {
    console.error("Error sending reset email", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ✅ Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update Profile
router.put("/update", verifyAuth, async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// ✅ Get Current User Profile
router.get("/me", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Promote a user to admin (TEMPORARY, delete after use)
router.put("/promote/:email", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { role: "admin" },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User promoted to admin", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
