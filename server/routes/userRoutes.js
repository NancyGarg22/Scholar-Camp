const express = require("express");
const router = express.Router();
const verifyAuth = require("../middleware/verifyAuth");
const isAdmin = require("../middleware/isAdmin");
const User = require("../models/User");

router.get("/all", verifyAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});


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




// DELETE user by ID (admin-only)
router.delete("/:id", verifyAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

router.post("/bulk-delete", verifyAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: "Invalid IDs" });

    await User.deleteMany({ _id: { $in: ids } });

    res.json({ message: "Users deleted" });
  } catch (err) {
    console.error("Bulk user delete error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
