const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyAuth = require("../middleware/verifyAuth");
const isAdmin = require("../middleware/isAdmin");
const Listing = require("../models/Listing");
const User = require("../models/User");
const supabase = require("../utils/supabaseClient");
const { toggleBookmark } = require("../controllers/listingController");

const upload = multer({ storage: multer.memoryStorage() });
const BUCKET_NAME = "scholarcamp-notes";

// ✅ PATCH: Toggle Bookmark
router.patch("/:id/bookmark", verifyAuth, toggleBookmark);

// ✅ GET: My Bookmarks
router.get("/bookmarks/my", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("bookmarks");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: "Fetch bookmarks failed" });
  }
});

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

// ✅ GET: All Listings
router.get("/all", async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("uploadedBy", "name _id")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching listings" });
  }
});

// ✅ GET: My Uploads
router.get("/my-uploads", verifyAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ uploadedBy: req.user.id });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching uploads" });
  }
});

// ✅ GET: Search Listings
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

// ✅ PUT: Update Listing
router.put("/:id", verifyAuth, async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    listing.title = title || listing.title;
    listing.subject = subject || listing.subject;
    listing.description = description || listing.description;

    await listing.save();

    res.json({ message: "Listing updated", listing });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// ✅ DELETE: Listing
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

// ✅ ADMIN ONLY: Get all listings
router.get("/admin/all", verifyAuth, isAdmin, async (req, res) => {
  try {
    const listings = await Listing.find().populate("uploadedBy", "name email");
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});

// ✅ ADMIN ONLY: Monthly Upload Stats
router.get("/stats/monthly-uploads", verifyAuth, isAdmin, async (req, res) => {
  try {
    const stats = await Listing.aggregate([
      {
        $group: {
          _id: { $substr: ["$createdAt", 0, 7] },
          uploads: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(stats.map((s) => ({ month: s._id, uploads: s.uploads })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch upload stats" });
  }
});

// ✅ GET: Single Listing (Keep LAST)
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch listing" });
  }
});

// routes/listings.js (or wherever you define routes)
router.post('/bulk-delete', async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  try {
    await Listing.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Listings deleted successfully' });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
});

module.exports = router;
