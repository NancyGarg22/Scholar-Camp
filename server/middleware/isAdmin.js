const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user?.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error verifying admin role" });
  }
};

module.exports = isAdmin;
