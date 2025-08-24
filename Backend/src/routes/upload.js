import express from 'express';
import upload from '../middleware/upload.js';
import { verifyToken, requireUser } from '../middleware/auth.js';

const router = express.Router();

// Upload image route
router.post('/image', verifyToken, requireUser, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No image file provided'
        }
      });
    }

    // Return the file path
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload image'
      }
    });
  }
});

export default router;
