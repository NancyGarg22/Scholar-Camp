// controllers/listingController.js

const Listing = require("../models/Listing");

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
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
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
