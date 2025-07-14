const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyAuth = require("../middleware/verifyAuth");
const Listing = require("../models/Listing");
const User = require("../models/User");
const supabase = require("../utils/supabaseClient");
const { toggleBookmark } = require("../controllers/listingController");

const upload = multer({ storage: multer.memoryStorage() });
const BUCKET_NAME = "scholarcamp-notes";

// ✅ PATCH: Toggle Bookmark
router.patch("/:id/bookmark", verifyAuth, toggleBookmark);

// ✅ POST: Upload
router.post("/upload", verifyAuth, upload.single("file"), async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      category,
      format,
      availability,
      lendingDuration,
    } = req.body;

    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file provided" });

    const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    const fileUrl = publicUrlData?.publicUrl;

    const newListing = new Listing({
      title,
      subject,
      description,
      category,
      format,
      availability,
      lendingDuration,
      fileUrl,
      uploadedBy: req.user.id,
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    res.status(500).json({ message: "Upload failed" });
  }
});

// ✅ GET All Listings
router.get("/all", async (req, res) => {
  try {
    const listings = await Listing.find().populate("uploadedBy", "name _id").sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching listings" });
  }
});

// ✅ GET My Uploads
router.get("/my-uploads", verifyAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ uploadedBy: req.user.id });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching uploads" });
  }
});

// ✅ GET Search Listings
router.get("/search/query", async (req, res) => {
  try {
    const q = req.query.q || "";
    const listings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { subject: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
});

// ✅ GET My Bookmarks
router.get("/bookmarks/my", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("bookmarks");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: "Fetch bookmarks failed" });
  }
});

// ✅ PUT Update Listing
router.put("/:id", verifyAuth, async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    console.log("Received update request:", { title, subject, description });

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Optional: Check permission
    if (listing.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Apply updates
    listing.title = title || listing.title;
    listing.subject = subject || listing.subject;
    listing.description = description || listing.description;

    await listing.save();

    res.json({ message: "Listing updated", listing });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});


// ✅ DELETE Listing
router.delete("/:id", verifyAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await listing.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ✅ GET Single Listing (Keep LAST)
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch listing" });
  }
});

module.exports = router;
