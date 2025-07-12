const express = require("express");
const router = express.Router();
const verifyAuth = require("../middleware/verifyAuth");

// Get current user info
router.get("/me", verifyAuth, async (req, res) => {
  // example route
  res.json({ message: "You are authenticated", userId: req.user });
});
router.put("/change-password", verifyAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user);
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Error changing password" });
  }
});

// GET all users (admin only)
router.get("/all", verifyAuth, async (req, res) => {
  const currentUser = await User.findById(req.user);
  if (currentUser.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

module.exports = router;
