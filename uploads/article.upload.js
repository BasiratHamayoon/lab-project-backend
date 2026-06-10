const multer = require("multer");

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const articleFileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type for cover image. Allowed types: jpeg, jpg, png, webp`
      ),
      false
    );
  }
};

const articleCoverUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: articleFileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

module.exports = articleCoverUpload;