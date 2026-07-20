import express from 'express';
import Event from '../models/event.model.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/events
router.post('/', protect, admin, async (req, res) => {
  const { title, description, date, location, branch } = req.body;
  try {
    const event = new Event({
      title,
      description,
      date,
      location,
      branch,
      creator: req.user._id,
    });
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/events
router.get('/', protect, async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('creator', 'username')
      .populate('attendees', 'username _id');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/events/branch/:branchName
router.get('/branch/:branchName', protect, async (req, res) => {
  try {
    const events = await Event.find({ branch: req.params.branchName })
      .populate('creator', 'username')
      .populate('attendees', 'username _id');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/myevents
router.get('/myevents', protect, async (req, res) => {
  try {
    const events = await Event.find({ attendees: req.user._id })
      .populate('creator', 'username')
      .populate('feedback.user', 'username _id');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/register
router.post('/:id/register', protect, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot register for events.' });
  }
  try {
    const event = await Event.findById(req.params.id);
    if (!event) { return res.status(404).json({ message: 'Event not found' }); }
    if (event.attendees.some(attendee => attendee.equals(req.user._id))) {
      return res.status(400).json({ message: 'Already registered' });
    }
    event.attendees.push(req.user._id);
    await event.save();
    res.json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/events/:id/feedback
router.post('/:id/feedback', protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) { return res.status(404).json({ message: 'Event not found' }); }

    if (new Date(event.date) > new Date()) {
      return res.status(400).json({ message: 'Cannot review event that hasn\'t happened yet.' });
    }
    if (!event.attendees.some(attendee => attendee.equals(req.user._id))) {
      return res.status(403).json({ message: 'You must be registered to review this event.' });
    }
    if (event.feedback.some(fb => fb.user.equals(req.user._id))) {
      return res.status(400).json({ message: 'You have already left feedback.' });
    }
    event.feedback.push({
      user: req.user._id,
      rating: Number(rating),
      comment
    });
    await event.save();
    res.status(201).json({ message: 'Feedback submitted' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   DELETE /api/events/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;