import express from 'express';
import Workshop from '../models/workshop.model.js'; // <-- CHANGED
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/workshops
router.post('/', protect, admin, async (req, res) => {
  const { title, description, date, location, branch } = req.body;
  try {
    const workshop = new Workshop({ // <-- CHANGED
      title,
      description,
      date,
      location,
      branch,
      creator: req.user._id,
    });
    const createdWorkshop = await workshop.save(); // <-- CHANGED
    res.status(201).json(createdWorkshop);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/workshops
router.get('/', protect, async (req, res) => {
  try {
    const workshops = await Workshop.find({}) // <-- CHANGED
      .populate('creator', 'username')
      .populate('attendees', 'username _id');
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/workshops/myworkshops
router.get('/myworkshops', protect, async (req, res) => {
  try {
    const workshops = await Workshop.find({ attendees: req.user._id }) // <-- CHANGED
      .populate('creator', 'username')
      .populate('feedback.user', 'username _id');
    res.json(workshops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/workshops/:id/register
router.post('/:id/register', protect, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot register for workshops.' });
  }
  try {
    const workshop = await Workshop.findById(req.params.id); // <-- CHANGED
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    if (workshop.attendees.some(attendee => attendee.equals(req.user._id))) {
      return res.status(400).json({ message: 'Already registered' });
    }
    workshop.attendees.push(req.user._id);
    await workshop.save();
    res.json({ message: 'Registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/workshops/:id/feedback
router.post('/:id/feedback', protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const workshop = await Workshop.findById(req.params.id); // <-- CHANGED
    if (!workshop) { return res.status(404).json({ message: 'Workshop not found' }); }
    if (new Date(workshop.date) > new Date()) {
        return res.status(400).json({ message: 'Cannot review workshop that hasn\'t happened yet.' });
    }
    if (!workshop.attendees.some(attendee => attendee.equals(req.user._id))) {
      return res.status(403).json({ message: 'You must be registered to review this workshop.' });
    }
    if (workshop.feedback.some(fb => fb.user.equals(req.user._id))) {
      return res.status(400).json({ message: 'You have already left feedback.' });
    }
    workshop.feedback.push({
      user: req.user._id,
      rating: Number(rating),
      comment
    });
    await workshop.save();
    res.status(201).json({ message: 'Feedback submitted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

export default router;