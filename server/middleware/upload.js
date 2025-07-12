const multer = require("multer");
const storage = multer.memoryStorage(); // to get buffer for Cloudinary
const upload = multer({ storage });
module.exports = upload;
