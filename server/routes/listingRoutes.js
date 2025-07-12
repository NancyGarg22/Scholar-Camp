const express = require("express");
const router = express.Router();
const { Readable } = require("stream");
const verifyAuth = require("../middleware/verifyAuth");
const Listing = require("../models/Listing");
const User = require("../models/User");
const upload = require("../middleware/upload");
const cloudinary = require("../utils/cloudinary");

// ✅ Upload a new listing
router.post("/upload", verifyAuth, upload.single("file"), async (req, res) => {
  try {
    const { title, subject, description } = req.body;

    if (!req.file || !req.file.buffer)
      return res.status(400).json({ message: "No file uploaded" });

    const stream = cloudinary.uploader.upload_stream(
      { folder: "scholarcamp_notes", resource_type: "auto" },
      async (error, result) => {
        if (error) {
          console.error("❌ Cloudinary error:", error);
          return res.status(500).json({ message: "Upload failed" });
        }

        const listing = new Listing({
          title,
          subject,
          description,
          fileUrl: result.secure_url,
          owner: req.user,
        });

        await listing.save();
        res.status(201).json({ message: "Listing uploaded", listing });
      }
    );

    Readable.from(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all listings
router.get("/all", async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error("❌ Fetch listings error:", err);
    res.status(500).json({ message: "Error fetching listings" });
  }
});

// ✅ Get my uploads
router.get("/my", verifyAuth, async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error("❌ My uploads fetch error:", err);
    res.status(500).json({ message: "Error fetching your uploads" });
  }
});

// ✅ Toggle bookmark
router.patch("/:id/bookmark", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const listingId = req.params.id;

    const alreadyBookmarked = user.bookmarks.includes(listingId);
    if (alreadyBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== listingId);
    } else {
      user.bookmarks.push(listingId);
    }

    await user.save();
    res.json({ bookmarked: !alreadyBookmarked });
  } catch (err) {
    console.error("❌ Bookmark toggle error:", err);
    res.status(500).json({ message: "Bookmark toggle failed" });
  }
});

// ✅ Get bookmarked listings
router.get("/bookmarks/my", verifyAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user).populate("bookmarks");
    res.json(user.bookmarks);
  } catch (err) {
    console.error("❌ Fetch bookmarks error:", err);
    res.status(500).json({ message: "Error fetching bookmarks" });
  }
});

// ✅ Delete a listing
router.delete("/:id", verifyAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Not found" });

    if (listing.owner.toString() !== req.user)
      return res.status(403).json({ message: "Unauthorized" });

    await listing.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Error deleting listing" });
  }
});

// ✅ Get listing by ID
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (err) {
    console.error("❌ Get listing by ID error:", err);
    res.status(500).json({ message: "Error fetching listing" });
  }
});

// ✅ Update a listing
router.put("/:id", verifyAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.owner.toString() !== req.user)
      return res.status(403).json({ message: "Unauthorized" });

    const { title, subject, description } = req.body;
    listing.title = title;
    listing.subject = subject;
    listing.description = description;

    await listing.save();
    res.json({ message: "Listing updated", listing });
  } catch (err) {
    console.error("❌ Update listing error:", err);
    res.status(500).json({ message: "Error updating listing" });
  }
});

// ✅ Increment download count
router.patch("/:id/download", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.downloadCount = (listing.downloadCount || 0) + 1;
    await listing.save();
    res.json({ message: "Download count updated" });
  } catch (err) {
    console.error("❌ Download count update error:", err);
    res.status(500).json({ message: "Error updating download count" });
  }
});

module.exports = router;
