const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make sure the uploads folders exist
const profilePicturesDir = path.join(__dirname, '../uploads/profile-pictures');
const recipeImagesDir = path.join(__dirname, '../uploads/recipe-images');

[profilePicturesDir, recipeImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper to create storage config
const createStorage = (destinationDir) => multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    const userId = req.user?.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

// Only accept image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Create upload instances
const profileUpload = multer({
  storage: createStorage(profilePicturesDir),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

const recipeUpload = multer({
  storage: createStorage(recipeImagesDir),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Export the middleware
const uploadProfilePicture = profileUpload.single('profilePicture');
const uploadRecipeImage = recipeUpload.single('recipeImage');

module.exports = {
  uploadProfilePicture,
  uploadRecipeImage,
  profilePicturesDir,
  recipeImagesDir
};

