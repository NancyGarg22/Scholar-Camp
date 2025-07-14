const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },

    // ✅ Social Links
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },

    // ✅ Bookmarked Listings
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],

    // You can add settings or other fields here later
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
