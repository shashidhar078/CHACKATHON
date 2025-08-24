import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

class AIService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.rateLimitCount = 0;
    this.rateLimitReset = Date.now();
  }

  async makeGeminiRequest(prompt) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Rate limiting: 60 requests per minute
    const now = Date.now();
    if (now > this.rateLimitReset) {
      this.rateLimitCount = 0;
      this.rateLimitReset = now + 60000; // 1 minute
    }

    if (this.rateLimitCount >= 60) {
      throw new Error('Rate limit exceeded for Gemini API');
    }

    this.rateLimitCount++;

    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) {
        return response.data.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected Gemini API response format:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Gemini API error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // If it's a rate limit or API error, throw
      if (error.response?.status >= 400) {
        throw new Error(`Gemini API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      }
      
      // For network errors, return fallback
      return null;
    }
  }

  async moderateText(text) {
    const prompt = `You are a strict content safety reviewer. Analyze this text for hate speech, harassment, self-harm, sexual content, violence, and spam. Respond with JSON only in this exact format:
{
  "status": "Safe" or "Flagged",
  "reason": "brief explanation if flagged",
  "confidence": number between 0 and 1
}

Text to analyze: "${text}"`;

    try {
      const response = await this.makeGeminiRequest(prompt);
      
      if (!response) {
        return { status: 'Skipped', reason: 'AI service unavailable', confidence: 0 };
      }

      // Try to parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { status: 'Skipped', reason: 'Invalid AI response format', confidence: 0 };
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        status: result.status || 'Safe',
        reason: result.reason || '',
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      console.error('Moderation error:', error);
      
      // Simple fallback moderation for common offensive words
      const offensiveWords = ['fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'whore', 'slut'];
      const lowerText = text.toLowerCase();
      const foundOffensive = offensiveWords.find(word => lowerText.includes(word));
      
      if (foundOffensive) {
        return { 
          status: 'Flagged', 
          reason: `Contains offensive language: ${foundOffensive}`, 
          confidence: 0.8 
        };
      }
      
      return { status: 'Skipped', reason: 'Moderation failed', confidence: 0 };
    }
  }

  async summarizeThread(items) {
    if (!items || items.length === 0) {
      return null;
    }

    // Limit to last 20 items to stay within token limits
    const recentItems = items.slice(-20);
    
    const content = recentItems.map(item => 
      `${item.author}: ${item.content}`
    ).join('\n\n');

    const prompt = `Summarize this thread discussion into exactly 3 bullet points. Use neutral tone and focus on actionable takeaways. Avoid opinions and personal information. Format as bullet points only.

Discussion:
${content}

Summary:`;

    try {
      const response = await this.makeGeminiRequest(prompt);
      
      if (!response) {
        return null;
      }

      // Clean up the response to get just the bullet points
      const lines = response.split('\n').filter(line => 
        line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')
      );

      if (lines.length === 0) {
        return null;
      }

      return lines.slice(0, 3).join('\n');
    } catch (error) {
      console.error('Summarization error:', error);
      return null;
    }
  }
}

export default new AIService();
