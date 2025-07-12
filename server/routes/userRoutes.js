const express = require("express");
const router = express.Router();
const verifyAuth = require("../middleware/verifyAuth");

// Get current user info
router.get("/me", verifyAuth, async (req, res) => {
  // example route
  res.json({ message: "You are authenticated", userId: req.user });
});

module.exports = router;
