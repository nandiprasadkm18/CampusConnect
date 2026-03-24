import express from 'express';
import Workshop from '../models/workshop.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import { protect, admin } from '../middleware/auth.middleware.js';
import { validateEvent } from '../middleware/validator.js';
import { emitNewWorkshop } from '../socket.js';
import crypto from 'crypto';

import { upload } from '../utils/cloudinaryConfig.js';

const router = express.Router();

// @route   POST /api/workshops
router.post('/', protect, admin, upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'paymentQR', maxCount: 1 }
]), validateEvent, async (req, res) => {
  const { title, description, date, location, branch, category, capacity, maxGroupSize, isPaid, fee, whatsappLink } = req.body;
  
  const banner = req.files?.['banner'] ? req.files['banner'][0].path : '';
  const paymentQR = req.files?.['paymentQR'] ? req.files['paymentQR'][0].path : '';
  
  try {
    const workshop = new Workshop({
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
    const createdWorkshop = await workshop.save();
    
    // 1. Create persistent notifications for all standard users
    const users = await User.find({ role: 'user' });
    const notifications = users.map(u => ({
      user: u._id,
      message: `New Workshop: "${title}" is now open for registration!`,
      link: `/workshops`
    }));
    await Notification.insertMany(notifications);

    // 2. Broadcast real-time toast to online users
    emitNewWorkshop(createdWorkshop);
    
    res.status(201).json(createdWorkshop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/workshops
router.get('/', protect, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const workshops = await Workshop.find({})
      .populate('creator', 'username')
      .populate('attendees.user', 'username profile')
      .populate('feedback.user', 'username profile')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 });
    
    const total = await Workshop.countDocuments();
    
    res.json({
      workshops,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/workshops/recommendations
router.get('/recommendations', protect, async (req, res) => {
  try {
    if (!req.user.profile || !req.user.profile.branch) {
      return res.status(400).json({ message: 'Complete your profile for personalized recommendations.' });
    }

    const { branch } = req.user.profile;
    
    const workshops = await Workshop.find({
      branch: { $in: [branch.toLowerCase(), 'general'] },
      'attendees.user': { $ne: req.user._id },
      date: { $gte: new Date() }
    })
    .limit(5)
    .sort({ date: 1 });

    res.json(workshops);
  } catch (error) {
    res.status(500).json({ message: 'Server error during recommendation processing' });
  }
});

// @route   GET /api/workshops/myworkshops
router.get('/myworkshops', protect, async (req, res) => {
  try {
    const workshops = await Workshop.find({ 'attendees.user': req.user._id })
      .populate('creator', 'username')
      .populate('feedback.user', 'username _id');
    
    const mappedWorkshops = workshops.map(workshop => {
      const attendeeData = workshop.attendees.find(a => a.user.equals(req.user._id));
      return {
        ...workshop._doc,
        qrToken: attendeeData?.qrToken,
        attended: attendeeData?.attended,
        attendedAt: attendeeData?.attendedAt
      };
    });

    res.json(mappedWorkshops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/workshops/:id/register
router.post('/:id/register', protect, upload.single('paymentScreenshot'), async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot register for workshops.' });
  }
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }
    
    // Check for payment screenshot if it's a paid workshop
    if (workshop.isPaid && !req.file) {
      return res.status(400).json({ message: 'Payment screenshot is required for this workshop.' });
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

    if (totalRegistrants > (workshop.maxGroupSize || 1)) {
      return res.status(400).json({ message: `Maximum group size for this workshop is ${workshop.maxGroupSize}.` });
    }

    if (workshop.capacity > 0 && (workshop.attendees.length + totalRegistrants) > workshop.capacity) {
      return res.status(400).json({ message: 'Workshop session is full' });
    }

    const userUsn = req.user.profile?.usn?.toUpperCase();
    const allUsnsToCheck = [userUsn, ...(parsedGroupMembers?.map(m => m.usn.toUpperCase()) || [])];
    
    const alreadyRegistered = workshop.attendees.filter(a => allUsnsToCheck.includes(a.usn));
    if (alreadyRegistered.length > 0) {
      const names = alreadyRegistered.map(a => a.fullName || a.usn).join(', ');
      return res.status(400).json({ message: `Registration failed. Already registered: ${names}` });
    }

    const registrations = [];
    const groupId = parsedGroupMembers?.length > 0 ? `GRP-${userUsn}-${Date.now()}` : null;
    const leaderToken = crypto.randomBytes(16).toString('hex');

    // 1. Add leader
    registrations.push({
      user: req.user._id,
      fullName: req.user.username,
      usn: userUsn,
      qrToken: leaderToken,
      attended: false,
      groupId,
      isGroupLeader: parsedGroupMembers?.length > 0,
      paymentScreenshot: req.file ? req.file.path : '',
      paymentStatus: workshop.isPaid ? 'pending' : 'n/a'
    });

    // 2. Add members
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
          paymentStatus: workshop.isPaid ? 'pending' : 'n/a',
          invitationStatus: 'pending' // Members must accept
        });

        if (memberUser) {
          await Notification.create({
            user: memberUser._id,
            message: `Workshop Invitation: ${req.user.username} invited you to join team for "${workshop.title}".`,
            link: `/notifications`,
            type: 'team_invitation',
            data: {
              workshopId: workshop._id,
              groupId: groupId,
              leaderName: req.user.username
            }
          });
        }
      }
    }

    workshop.attendees.push(...registrations);
    await workshop.save();

    res.json({ 
      message: parsedGroupMembers?.length > 0 ? 'Group registered successfully!' : 'Registered successfully', 
      qrToken: leaderToken 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   GET /api/workshops/:id/public
router.get('/:id/public', async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id).select('title date location description');
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/workshops/:id/verify-attendance
router.post('/:id/verify-attendance', protect, admin, async (req, res) => {
  const { qrToken } = req.body;
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    const attendee = workshop.attendees.find(a => a.qrToken === qrToken);
    if (!attendee) {
      return res.status(404).json({ message: 'Invalid token or student not registered for this workshop.' });
    }

    if (attendee.attended) {
      return res.status(400).json({ message: 'Attendance already marked.' });
    }

    attendee.attended = true;
    attendee.attendedAt = new Date();
    
    await workshop.save();
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/workshops/:id/attendees/:attendeeId/verify-payment
router.post('/:id/attendees/:attendeeId/verify-payment', protect, admin, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    const attendee = workshop.attendees.id(req.params.attendeeId);
    if (!attendee) return res.status(404).json({ message: 'Attendee not found' });

    // If it's a group, verify all members in that group
    if (attendee.groupId) {
      workshop.attendees.forEach(async (a) => {
        if (a.groupId === attendee.groupId) {
          a.paymentStatus = 'verified';
          // Notify each group member
          if (a.user) {
            await Notification.create({
              user: a.user,
              message: `Payment Verified: Your team's spot for "${workshop.title}" is now confirmed!`,
              link: '/myworkshops'
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
          message: `Payment Verified: Your spot for "${workshop.title}" is now confirmed!`,
          link: '/myworkshops'
        });
      }
    }

    await workshop.save();
    res.json({ message: 'Payment verified successfully for the group' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/workshops/:id/respond-invitation
router.post('/:id/respond-invitation', protect, async (req, res) => {
  const { accept } = req.body;
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    const attendee = workshop.attendees.find(a => a.user && a.user.equals(req.user._id));
    if (!attendee) return res.status(404).json({ message: 'You are not registered for this workshop.' });

    if (accept) {
      attendee.invitationStatus = 'accepted';
    } else {
      attendee.invitationStatus = 'declined';
      // Optional: remove attendee or keep as declined
    }

    await workshop.save();

    // Mark the notification as responded
    await Notification.updateMany(
      { user: req.user._id, 'data.workshopId': workshop._id, type: 'team_invitation' },
      { $set: { responded: true, read: true } }
    );

    res.json({ message: `Invitation ${accept ? 'accepted' : 'declined'} successfully` });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/workshops/:id/self-mark
router.post('/:id/self-mark', async (req, res) => {
  const { name, usn } = req.body;
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    const workshopDate = new Date(workshop.date);
    const now = new Date();
    const startTime = new Date(workshopDate.getTime() - 60 * 60 * 1000);
    const endTime = new Date(workshopDate.getTime() + 4 * 60 * 60 * 1000);

    if (now < startTime || now > endTime) {
      return res.status(400).json({ message: 'Attendance gateway is currently inactive for this session.' });
    }

    const user = await User.findOne({ 'profile.usn': usn.toUpperCase() });
    
    if (user && user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators cannot participate in campus sessions.' });
    }
    
    let attendee = workshop.attendees.find(a => 
      (user && a.user.equals(user._id)) || 
      (a.manualEntry && a.usn === usn.toUpperCase())
    );

    if (attendee && attendee.attended) {
      return res.status(400).json({ message: 'Attendance already recorded for this USN.' });
    }

    if (!attendee) {
      workshop.attendees.push({
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

    await workshop.save();
    res.json({ message: `Welcome ${name}, your attendance is confirmed.` });
  } catch (error) {
    res.status(500).json({ message: `Error marking attendance: ${error.message}` });
  }
});

// @route   POST /api/workshops/:id/toggle-feedback
router.post('/:id/toggle-feedback', protect, admin, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    workshop.feedbackOpened = !workshop.feedbackOpened;
    await workshop.save();

    res.json({ 
      message: `Feedback ${workshop.feedbackOpened ? 'opened' : 'closed'} successfully`,
      feedbackOpened: workshop.feedbackOpened 
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/workshops/:id/feedback
router.post('/:id/feedback', protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    if (!workshop.feedbackOpened) {
      return res.status(403).json({ message: 'Feedback is currently closed for this workshop.' });
    }

    const isAttendee = workshop.attendees.some(a => a.user && a.user.toString() === req.user._id.toString());
    if (!isAttendee) {
      return res.status(403).json({ message: 'You must be registered to review this workshop.' });
    }

    if (workshop.feedback.some(fb => fb.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'You have already left feedback.' });
    }

    workshop.feedback.push({
      user: req.user._id,
      rating: Number(rating),
      comment
    });
    
    await workshop.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   DELETE /api/workshops/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: 'Workshop not found' });
    }

    await workshop.deleteOne();
    res.json({ message: 'Workshop removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;