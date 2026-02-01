// utils/multer.js
const multer = require('multer');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    // keep original filename
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'video/mp4',
    'video/mkv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Only images (jpg, png) and videos (mp4) are allowed'),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB
  },
  fileFilter
});

module.exports = upload;
