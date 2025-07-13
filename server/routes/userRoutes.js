const express = require("express");
const router = express.Router();
const verifyAuth = require("../middleware/verifyAuth");
const isAdmin = require("../middleware/isAdmin");
const User = require("../models/User");
const Listing = require("../models/Listing");

// GET all users (admin only)
router.get("/all", verifyAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// GET current user info
router.get("/me", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user info", err);
    res.status(500).json({ message: "Failed to fetch user info" });
  }
});

// PUT change password
// PUT change password
router.put("/change-password", verifyAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE user by ID (admin-only)
router.delete("/:id", verifyAuth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// POST bulk delete users (admin-only)
router.post("/bulk-delete", verifyAuth, isAdmin, async (req, res) => {
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

// GET profile stats and uploads summary
router.get("/profile/stats", verifyAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ uploadedBy: req.user.id });

    const totalUploads = listings.length;
    const peopleHelped = listings.length; // You can update this logic later

    const user = await User.findById(req.user.id);
    const publicProfile = user?.settings?.publicProfile ?? true;

    res.json({
      totalUploads,
      peopleHelped,
      publicProfile,
      uploads: listings,
    });
  } catch (err) {
    console.error("❌ Profile stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// PUT toggle public profile visibility
router.put("/profile/toggle-public", verifyAuth, async (req, res) => {
  try {
    console.log("User ID:", req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.settings = user.settings || {};
    user.settings.publicProfile = !user.settings.publicProfile;
    await user.save();

    res.json({ publicProfile: user.settings.publicProfile });
  } catch (err) {
    console.error("Toggle error", err);
    res.status(500).json({ message: "Failed to update visibility" });
  }
});


module.exports = router;
