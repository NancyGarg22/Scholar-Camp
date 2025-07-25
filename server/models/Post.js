const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }], // ✅ Add this
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
