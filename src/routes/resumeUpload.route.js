const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload.middleware');
const resumeController = require('../controller/resume.controller');
const authMiddleware = require('../middleware/auth.middleware')

router.post(
  '/upload',
  authMiddleware,
  upload.single('resume'),
  resumeController.uploadResume
)

module.exports = router;