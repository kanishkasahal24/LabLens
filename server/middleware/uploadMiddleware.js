const multer = require('multer');

// Store file in memory as Buffer for fast PDF parsing without leaving unlinked temp files
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/x-pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ];
  const name = file.originalname.toLowerCase();
  const isPdf = name.endsWith('.pdf');
  const isImage = name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp');

  if (allowedMimes.includes(file.mimetype) || isPdf || isImage) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload a PDF or an image (PNG, JPG, WEBP).'), false);
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
