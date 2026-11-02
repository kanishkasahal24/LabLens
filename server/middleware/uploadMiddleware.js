const multer = require('multer');

// Store file in memory as Buffer for fast PDF parsing without leaving unlinked temp files
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'application/x-pdf'];
  if (allowedMimes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF lab reports are supported.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Max 10MB file size limit
  },
  fileFilter
});

module.exports = upload;
