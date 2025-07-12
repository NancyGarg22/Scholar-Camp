const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  try {
   const user = await User.findById(req.userId); // ✅ consistent

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error in isAdmin" });
  }
};

module.exports = isAdmin;
