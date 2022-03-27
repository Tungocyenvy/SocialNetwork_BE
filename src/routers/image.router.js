const express = require('express');
const router = express.Router();
const uploadToCloudinary = require('../middleware/uploadToCloudinary');

const fileUploader = require('../config/cloudinary');

router.post(
  '/upload',
  fileUploader.single('upload'),
  uploadToCloudinary.uploadImageToCloudinary,
);

module.exports = router;
