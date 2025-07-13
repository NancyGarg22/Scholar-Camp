const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  
  // Add the settings object here
  settings: {
    publicProfile: {
      type: Boolean,
      default: true,
    },
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetToken: String,
  resetTokenExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
