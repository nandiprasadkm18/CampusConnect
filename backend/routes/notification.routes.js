import express from 'express';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js'; 
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/notifications/
// @desc    Get all notifications for logged in user (STANDARD USER ROUTE)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });
      
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- ADDED ADMIN ROUTE TO VIEW ALL NOTIFICATIONS ---
// @route   GET /api/notifications/admin/all
// @desc    Get ALL notifications for review (ADMIN ROUTE)
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('user', 'username') // <-- This populates the user's name
      .sort({ createdAt: -1 });
      
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// --- END ADD ---

// @route   PUT /api/notifications/readall
router.put('/readall', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/broadcast
router.post('/broadcast', protect, admin, async (req, res) => {
  const { message } = req.body;
  
  if (!message || message.length < 5) {
    return res.status(400).json({ message: 'Message must be at least 5 characters.' });
  }

  try {
    const users = await User.find({ role: 'user', _id: { $ne: req.user._id } });
    if (users.length === 0) {
      return res.status(200).json({ message: 'No standard users found for broadcast.' });
    }

    const notifications = users.map(user => ({
      user: user._id,
      message: `[ADMIN BROADCAST] ${message}`,
      link: '/notifications'
    }));

    // --- THIS IS THE FIX ---
    // Changed Notification.insertMany(notifications) to Notification.create(notifications)
    await Notification.create(notifications);
    // --- END FIX ---
    
    res.status(201).json({ 
      message: `Broadcast sent to ${notifications.length} users successfully.` 
    });

  } catch (error) {
    console.error('Broadcast failed:', error);
    res.status(500).json({ 
        message: `Broadcast failed: ${error.message}`
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification by ID
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await Notification.deleteOne({ _id: req.params.id }); 
    res.json({ message: 'Notification removed' });

  } catch (error) {
    console.error('Notification deletion failed:', error);
    res.status(500).json({ message: 'Server error during deletion.' });
  }
});

export default router;