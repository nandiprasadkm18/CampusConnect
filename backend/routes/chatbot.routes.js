import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Event from '../models/event.model.js';
import Workshop from '../models/workshop.model.js';

const router = express.Router();

// @route   POST /api/chatbot/chat
// @desc    Proxy request to Groq AI
// @access  Private
router.post('/chat', protect, async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'Invalid messages format' });
  }

  try {
    // --- FETCH LIVE CONTEXT ---
    const [events, workshops] = await Promise.all([
      Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(5),
      Workshop.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(5)
    ]);

    const eventContext = events.length > 0 
      ? `Active Events: ${events.map(e => `${e.title} (${e.location})`).join(', ')}.`
      : "No live events currently scheduled.";
    
    const workshopContext = workshops.length > 0
      ? `Upcoming Workshops: ${workshops.map(w => `${w.title} (${w.location})`).join(', ')}.`
      : "No upcoming workshops.";

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: `You are CampusConnect AI. You have access to real-time campus data: ${eventContext} ${workshopContext} 
            Help students find these sessions, explain registration via the "JOIN EVENT" button, and guide them to the "QR Scanner" for attendance. 
            Always be concise and encouraging. If they ask about events or workshops, refer to the specific ones listed above.
            CRITICAL: Do NOT use markdown tables. Use bold text and clean bullet points for a premium, mobile-friendly list layout.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      return res.status(response.status).json({ message: 'AI processing failed' });
    }

    const data = await response.json();
    res.json({
      content: data.choices[0].message.content,
    });
  } catch (error) {
    console.error('Chatbot Server Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
