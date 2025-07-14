// routes/bookmarkRoutes.js
const express = require("express");
const router = express.Router();
const verifyAuth = require("../middleware/verifyAuth");
const Listing = require("../models/Listing");

// ✅ GET /api/bookmarks/my — get listings bookmarked by current user
router.get("/bookmarks/my", verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const listings = await Listing.find({ bookmarks: userId }).populate("uploadedBy");
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookmarks" });
  }
});

// ✅ PATCH /api/listings/:id/bookmark — toggle bookmark
router.patch("/listings/:id/bookmark", verifyAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const userId = req.user.id;
    const index = listing.bookmarks.indexOf(userId);

    if (index > -1) {
      listing.bookmarks.splice(index, 1); // remove
      listing.bookmarkCount = Math.max((listing.bookmarkCount || 1) - 1, 0);
    } else {
      listing.bookmarks.push(userId); // add
      listing.bookmarkCount = (listing.bookmarkCount || 0) + 1;
    }

    await listing.save();
    res.json({ message: "Bookmark toggled", bookmarks: listing.bookmarks });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
});

module.exports = router;
