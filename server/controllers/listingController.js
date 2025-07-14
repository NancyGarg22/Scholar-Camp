const Listing = require("../models/Listing");
const User = require("../models/User");

// ✅ GET: Monthly Upload Stats
exports.getMonthlyUploads = async (req, res) => {
  try {
    const uploads = await Listing.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formatted = uploads.map((item) => ({
      month: `${item._id.month}-${item._id.year}`,
      uploads: item.count,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error getting monthly uploads:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

// ✅ PATCH: Toggle Bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    console.log("✅ toggleBookmark hit:", req.params.id);

    const user = await User.findById(req.user.id);
    const listingId = req.params.id;

    if (!user) return res.status(404).json({ message: "User not found" });

    const isBookmarked = user.bookmarks.includes(listingId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((id) => id.toString() !== listingId);
    } else {
      user.bookmarks.push(listingId);
    }

    await user.save();
    res.json({ message: isBookmarked ? "Bookmark removed" : "Bookmark added" });
  } catch (error) {
    console.error("❌ Bookmark toggle error:", error);
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
};
