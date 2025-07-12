const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: String,
  subject: String,
  description: String,
  fileUrl: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Listing", listingSchema);
