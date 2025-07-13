const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyAuth = require("../middleware/verifyAuth");
const Listing = require("../models/Listing");
const User = require("../models/User");
const supabase = require("../utils/supabaseClient");

const upload = multer({ storage: multer.memoryStorage() });
const BUCKET_NAME = "scholarcamp-notes"; // ✅ Your bucket name

// ✅ POST: Upload file to Supabase Storage
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

// ✅ GET: All Public Listings
router.get("/all", async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error("❌ Error fetching listings:", err);
    res.status(500).json({ message: "Server error fetching listings" });
  }
});

// ✅ GET: My Uploads
// ✅ GET: My Uploads
router.get("/my-uploads", verifyAuth, async (req, res) => {
  try {
    console.log("👤 User ID from token:", req.user.id);
    const listings = await Listing.find({ uploadedBy: req.user.id }); // ✅ fix here
    res.json(listings);
  } catch (err) {
    console.error("❌ Error fetching uploads:", err);
    res.status(500).json({ message: "Server error fetching uploads" });
  }
});

// ✅ GET: Single Listing by ID
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    console.error("❌ Error fetching single listing:", err);
    res.status(500).json({ message: "Failed to fetch listing" });
  }
});





// ✅ PUT: Update a Listing
router.put("/:id", verifyAuth, async (req, res) => {
  try {
    const { title, subject, description } = req.body;

    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this listing" });
    }

    listing.title = title || listing.title;
    listing.subject = subject || listing.subject;
    listing.description = description || listing.description;

    await listing.save();
    res.json({ message: "Listing updated", listing });
  } catch (err) {
    console.error("❌ Error updating listing:", err);
    res.status(500).json({ message: "Failed to update listing" });
  }
});

// ✅ DELETE: Delete a Listing
router.delete("/:id", verifyAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this listing" });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting listing:", err.message);
    res.status(500).json({ message: "Failed to delete listing" });
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
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Failed to search listings" });
  }
});
// ✅ GET: My Bookmarks
router.get("/bookmarks/my", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("bookmarks");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.bookmarks);
  } catch (err) {
    console.error("❌ Error fetching bookmarks:", err);
    res.status(500).json({ message: "Failed to fetch bookmarks" });
  }
});

// ✅ POST: Bookmark a Listing
router.post("/bookmark/:id", verifyAuth, async (req, res) => {
  try {
    const listingId = req.params.id;
    const user = await User.findById(req.user.id);

    if (!user.bookmarks.includes(listingId)) {
      user.bookmarks.push(listingId);
      await user.save();
    }

    res.json({ message: "Bookmarked successfully" });
  } catch (err) {
    console.error("❌ Bookmark error:", err);
    res.status(500).json({ message: "Failed to bookmark" });
  }
});



module.exports = router;
