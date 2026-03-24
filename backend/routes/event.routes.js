import express from 'express';
import Event from '../models/event.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import { protect, admin } from '../middleware/auth.middleware.js';
import { validateEvent } from '../middleware/validator.js';
import { emitNewEvent } from '../socket.js';
import crypto from 'crypto';

import { upload } from '../utils/cloudinaryConfig.js';

const router = express.Router();

// @route   POST /api/events
router.post('/', protect, admin, upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'paymentQR', maxCount: 1 }
]), validateEvent, async (req, res) => {
  const { title, description, date, location, branch, category, capacity, maxGroupSize, isPaid, fee, whatsappLink } = req.body;
  
  const banner = req.files?.['banner'] ? req.files['banner'][0].path : '';
  const paymentQR = req.files?.['paymentQR'] ? req.files['paymentQR'][0].path : '';

  try {
    const event = new Event({
      title,
      description,
      date,
      location,
      branch,
      category,
      capacity: capacity || 100,
      maxGroupSize: maxGroupSize || 1,
      banner,
      isPaid: isPaid === 'true',
      fee: Number(fee) || 0,
      paymentQR,
      whatsappLink: whatsappLink || '',
      creator: req.user._id,
    });
    const createdEvent = await event.save();
    
    // 1. Create persistent notifications for all standard users
    const users = await User.find({ role: 'user' });
    const notifications = users.map(u => ({
      user: u._id,
      message: `New Event: "${title}" is now open for registration!`,
      link: `/events`
    }));
    await Notification.insertMany(notifications);

    // 2. Broadcast real-time toast to online users
    emitNewEvent(createdEvent);
    
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/events
router.get('/', protect, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const events = await Event.find({})
      .populate('creator', 'username')
      .populate('attendees.user', 'username profile')
      .populate('feedback.user', 'username profile')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 });
    
    const total = await Event.countDocuments();
    
    res.json({
      events,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/events/recommendations
router.get('/recommendations', protect, async (req, res) => {
  try {
    if (!req.user.profile || !req.user.profile.branch) {
      return res.status(400).json({ message: 'Complete your profile for personalized recommendations.' });
    }

    const { branch } = req.user.profile;
    
    const events = await Event.find({
      branch: { $in: [branch.toLowerCase(), 'general'] },
      'attendees.user': { $ne: req.user._id },
      date: { $gte: new Date() }
    })
    .limit(5)
    .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error during recommendation processing' });
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
    const events = await Event.find({ 'attendees.user': req.user._id })
      .populate('creator', 'username')
      .populate('feedback.user', 'username _id');
    
    const mappedEvents = events.map(event => {
      const attendeeData = event.attendees.find(a => a.user.equals(req.user._id));
      return {
        ...event._doc,
        qrToken: attendeeData?.qrToken,
        attended: attendeeData?.attended,
        attendedAt: attendeeData?.attendedAt
      };
    });

    res.json(mappedEvents);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/register
router.post('/:id/register', protect, upload.single('paymentScreenshot'), async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot register for events.' });
  }
  try {
    const event = await Event.findById(req.params.id);
    if (!event) { return res.status(404).json({ message: 'Event not found' }); }
    
    // Check for payment screenshot if it's a paid event
    if (event.isPaid && !req.file) {
      return res.status(400).json({ message: 'Payment screenshot is required for this event.' });
    }

    const { groupMembers } = req.body; 
    let parsedGroupMembers = [];
    if (groupMembers) {
      try {
        parsedGroupMembers = typeof groupMembers === 'string' ? JSON.parse(groupMembers) : groupMembers;
      } catch (e) {
        return res.status(400).json({ message: 'Invalid group members format' });
      }
    }

    const totalRegistrants = 1 + (parsedGroupMembers?.length || 0);

    if (totalRegistrants > (event.maxGroupSize || 1)) {
      return res.status(400).json({ message: `Maximum group size for this event is ${event.maxGroupSize}.` });
    }

    if (event.capacity > 0 && (event.attendees.length + totalRegistrants) > event.capacity) {
      return res.status(400).json({ message: 'Not enough seats remaining to register this group.' });
    }

    const userUsn = req.user.profile?.usn?.toUpperCase();
    const allUsnsToCheck = [userUsn, ...(parsedGroupMembers?.map(m => m.usn.toUpperCase()) || [])];
    
    const alreadyRegistered = event.attendees.filter(a => allUsnsToCheck.includes(a.usn));
    if (alreadyRegistered.length > 0) {
      const names = alreadyRegistered.map(a => a.fullName || a.usn).join(', ');
      return res.status(400).json({ message: `Registration failed. Already registered: ${names}` });
    }

    const registrations = [];
    const groupId = parsedGroupMembers?.length > 0 ? `GRP-${userUsn}-${Date.now()}` : null;
    
    // 1. Add the leader (the one who potentially uploaded payment screenshot)
    const leaderToken = crypto.randomBytes(16).toString('hex');
    registrations.push({
      user: req.user._id,
      fullName: req.user.username,
      usn: userUsn,
      qrToken: leaderToken,
      attended: false,
      groupId,
      isGroupLeader: parsedGroupMembers?.length > 0,
      paymentScreenshot: req.file ? req.file.path : '',
      paymentStatus: event.isPaid ? 'pending' : 'n/a'
    });

    // 2. Add group members
    if (parsedGroupMembers && parsedGroupMembers.length > 0) {
      for (const member of parsedGroupMembers) {
        const mToken = crypto.randomBytes(16).toString('hex');
        const memberUser = await User.findOne({ 'profile.usn': member.usn.toUpperCase() });
        
        registrations.push({
          user: memberUser ? memberUser._id : null,
          fullName: member.fullName,
          usn: member.usn.toUpperCase(),
          qrToken: mToken,
          attended: false,
          groupId,
          isGroupLeader: false,
          paymentStatus: event.isPaid ? 'pending' : 'n/a',
          invitationStatus: 'pending' // Members must accept
        });

        if (memberUser) {
          await Notification.create({
            user: memberUser._id,
            message: `Team Invitation: ${req.user.username} invited you to join team for "${event.title}".`,
            link: `/notifications`,
            type: 'team_invitation',
            data: {
              eventId: event._id,
              groupId: groupId,
              leaderName: req.user.username
            }
          });
        }
      }
    }

    event.attendees.push(...registrations);
    await event.save();

    res.json({ 
      message: parsedGroupMembers?.length > 0 ? 'Group registered successfully!' : 'Registered successfully', 
      qrToken: leaderToken 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/events/:id/public
router.get('/:id/public', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('title date location description');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/verify-attendance
router.post('/:id/verify-attendance', protect, admin, async (req, res) => {
  const { qrToken } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const attendee = event.attendees.find(a => a.qrToken === qrToken);
    if (!attendee) {
      return res.status(404).json({ message: 'Invalid token or student not registered for this event.' });
    }

    if (attendee.attended) {
      return res.status(400).json({ message: 'Attendance already marked for this user.' });
    }

    attendee.attended = true;
    attendee.attendedAt = new Date();
    
    await event.save();
    res.json({ message: 'Attendance marked successfully', studentId: attendee.user });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/events/:id/attendees/:attendeeId/verify-payment
router.post('/:id/attendees/:attendeeId/verify-payment', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const attendee = event.attendees.id(req.params.attendeeId);
    if (!attendee) return res.status(404).json({ message: 'Attendee not found' });

    // If it's a group, verify all members in that group
    if (attendee.groupId) {
      event.attendees.forEach(async (a) => {
        if (a.groupId === attendee.groupId) {
          a.paymentStatus = 'verified';
          // Notify each group member
          if (a.user) {
            await Notification.create({
              user: a.user,
              message: `Payment Verified: Your team's spot for "${event.title}" is now confirmed!`,
              link: '/myevents'
            });
          }
        }
      });
    } else {
      attendee.paymentStatus = 'verified';
      // Notify the user
      if (attendee.user) {
        await Notification.create({
          user: attendee.user,
          message: `Payment Verified: Your spot for "${event.title}" is now confirmed!`,
          link: '/myevents'
        });
      }
    }

    await event.save();
    res.json({ message: 'Payment verified successfully for the group' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/events/:id/respond-invitation
router.post('/:id/respond-invitation', protect, async (req, res) => {
  const { accept } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const attendee = event.attendees.find(a => a.user && a.user.equals(req.user._id));
    if (!attendee) return res.status(404).json({ message: 'You are not registered for this event.' });

    if (accept) {
      attendee.invitationStatus = 'accepted';
    } else {
      attendee.invitationStatus = 'declined';
      // Optional: remove attendee or keep as declined
    }

    await event.save();
    
    // Mark the notification as responded
    await Notification.updateMany(
      { user: req.user._id, 'data.eventId': event._id, type: 'team_invitation' },
      { $set: { responded: true, read: true } }
    );

    res.json({ message: `Invitation ${accept ? 'accepted' : 'declined'} successfully` });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/events/:id/self-mark
router.post('/:id/self-mark', async (req, res) => {
  const { name, usn } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const eventDate = new Date(event.date);
    const now = new Date();
    const startTime = new Date(eventDate.getTime() - 60 * 60 * 1000);
    const endTime = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);

    if (now < startTime || now > endTime) {
      return res.status(400).json({ message: 'Attendance gateway is currently inactive for this session.' });
    }

    const user = await User.findOne({ 'profile.usn': usn.toUpperCase() });
    
    if (user && user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators cannot participate in campus sessions.' });
    }
    
    let attendee = event.attendees.find(a => 
      (user && a.user.equals(user._id)) || 
      (a.manualEntry && a.usn === usn.toUpperCase())
    );

    if (attendee && attendee.attended) {
      return res.status(400).json({ message: 'Attendance already recorded for this USN.' });
    }

    if (!attendee) {
      event.attendees.push({
        user: user ? user._id : null,
        fullName: name,
        usn: usn.toUpperCase(),
        attended: true,
        attendedAt: new Date(),
        manualEntry: !user
      });
    } else {
      attendee.attended = true;
      attendee.attendedAt = new Date();
      attendee.fullName = name;
    }

    await event.save();
    res.json({ message: `Welcome ${name}, your attendance is confirmed.` });
  } catch (error) {
    res.status(500).json({ message: `Error marking attendance: ${error.message}` });
  }
});

// @route   POST /api/events/:id/toggle-feedback
router.post('/:id/toggle-feedback', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.feedbackOpened = !event.feedbackOpened;
    await event.save();

    res.json({ 
      message: `Feedback ${event.feedbackOpened ? 'opened' : 'closed'} successfully`,
      feedbackOpened: event.feedbackOpened 
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/events/:id/feedback
router.post('/:id/feedback', protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (!event.feedbackOpened) {
      return res.status(403).json({ message: 'Feedback is currently closed for this event.' });
    }

    const isAttendee = event.attendees.some(a => a.user && a.user.toString() === req.user._id.toString());
    if (!isAttendee) {
      return res.status(403).json({ message: 'You must be registered to review this event.' });
    }

    if (event.feedback.some(fb => fb.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'You have already left feedback.' });
    }

    event.feedback.push({
      user: req.user._id,
      rating: Number(rating),
      comment
    });
    
    await event.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
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