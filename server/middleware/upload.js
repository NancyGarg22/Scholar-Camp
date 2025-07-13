const express = require("express");
const router = express.Router();
const multer = require("multer");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const supabase = require("../utils/supabaseClient"); // ✅ NEW IMPORT


// ✅ POST: Upload a new listing
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    const fileUrl = req.file?.secure_url;

console.log("📦 Upload File:", req.file);

    // You can save this to DB here if needed

    res.status(201).json({
      title,
      subject,
      description,
      fileUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
