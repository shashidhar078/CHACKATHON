import express from 'express';
import aiService from '../utils/aiService.js';

const router = express.Router();

// Test Gemini API
router.get('/gemini', async (req, res) => {
  try {
    console.log('Testing Gemini API...');
    const result = await aiService.moderateText('This is a test message');
    console.log('Gemini API result:', result);
    res.json({
      success: true,
      result,
      message: 'Gemini API is working'
    });
  } catch (error) {
    console.error('Gemini API test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gemini API test failed'
    });
  }
});

export default router;
