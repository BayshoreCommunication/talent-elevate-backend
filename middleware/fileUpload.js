const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Storage

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join("/tmp", "uploads");

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (err) {
      console.error("Failed to create upload directory:", err);
      cb(new Error("Failed to create upload directory"), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});


// File type filter

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /pdf|jpg|jpeg|png/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed!"), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

// Middleware for single file upload
const uploadFileMiddleware = upload.single("file");

module.exports = { uploadFileMiddleware };
