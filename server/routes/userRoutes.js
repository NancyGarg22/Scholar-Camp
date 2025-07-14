const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const verifyAuth = require("../middleware/verifyAuth");
const isAdmin = require("../middleware/isAdmin");
const User = require("../models/User");
const Listing = require("../models/Listing");

// ✅ GET all users (admin only)
router.get("/all", verifyAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✅ GET current user info
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

// ✅ PUT change password
router.put("/change-password", verifyAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE user (admin only)
router.delete("/:id", verifyAuth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ✅ POST bulk delete (admin only)
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

// ✅ GET profile stats + uploads
router.get("/profile/stats", verifyAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ uploadedBy: req.user.id });

    const totalUploads = listings.length;
    const peopleHelped = listings.length;

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

// ✅ PUT toggle public profile
router.put("/profile/toggle-public", verifyAuth, async (req, res) => {
  try {
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

// ✅ PUT update profile info (name, settings)
router.put("/profile/update", verifyAuth, async (req, res) => {
  try {
    const { name, settings } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (settings) {
      user.settings = {
        ...user.settings,
        ...settings,
      };
    }

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// ✅ PUT update LinkedIn & Instagram
router.put("/update-socials", verifyAuth, async (req, res) => {
  try {
    const { linkedin, instagram } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { linkedin, instagram },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    console.error("Error updating socials:", err);
    res.status(500).json({ error: "Failed to update social links" });
  }
});

// ✅ GET public profile by ID
router.get("/public/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email role linkedin instagram settings");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.settings?.publicProfile === false) {
      return res.status(403).json({ message: "This profile is private" });
    }

    const uploads = await Listing.find({ uploadedBy: user._id });

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      linkedin: user.linkedin || "",
      instagram: user.instagram || "",
      uploads,
    });
  } catch (err) {
    console.error("❌ Public profile fetch error", err);
    res.status(500).json({ message: "Failed to fetch public profile" });
  }
});

module.exports = router;

