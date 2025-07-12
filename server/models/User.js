const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }], // ✅
  resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
