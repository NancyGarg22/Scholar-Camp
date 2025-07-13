const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: String,
    subject: String,
    description: String,
    fileUrl: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
