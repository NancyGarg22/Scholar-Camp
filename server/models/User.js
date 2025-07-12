const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" }, // ✅ Add this if missing

  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }], // ✅
  resetPasswordToken: String,
    resetPasswordExpires: Date,
    resetToken: String,
  resetTokenExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
