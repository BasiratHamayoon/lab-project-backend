const multer = require("multer");

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const thumbnailFileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type for thumbnail. Allowed types: jpeg, jpg, png, webp`
      ),
      false
    );
  }
};

const videoThumbnailUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: thumbnailFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = videoThumbnailUpload;