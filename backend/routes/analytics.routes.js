import express from 'express';
import Event from '../models/event.model.js';
import Workshop from '../models/workshop.model.js';
import User from '../models/user.model.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/analytics/overview
// Provides high-level metrics for the admin dashboard
router.get('/overview', protect, admin, async (req, res) => {
  try {
    // 1. Total Counts
    const totalStudents = await User.countDocuments({ role: 'user' });
    const totalEvents = await Event.countDocuments();
    const totalWorkshops = await Workshop.countDocuments();

    // 2. Registration Analytics (Aggregated)
    const eventStats = await Event.aggregate([
      {
        $project: {
          registrations: { $size: '$attendees' },
          attendance: {
            $size: {
              $filter: {
                input: '$attendees',
                as: 'attendee',
                cond: { $eq: ['$$attendee.attended', true] }
              }
            }
          },
          avgRating: { $avg: '$feedback.rating' }
        }
      },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: '$registrations' },
          totalAttendance: { $sum: '$attendance' },
          avgEventRating: { $avg: '$avgRating' }
        }
      }
    ]);

    const workshopStats = await Workshop.aggregate([
      {
        $project: {
          registrations: { $size: '$attendees' },
          attendance: {
            $size: {
              $filter: {
                input: '$attendees',
                as: 'attendee',
                cond: { $eq: ['$$attendee.attended', true] }
              }
            }
          },
          avgRating: { $avg: '$feedback.rating' }
        }
      },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: '$registrations' },
          totalAttendance: { $sum: '$attendance' },
          avgWorkshopRating: { $avg: '$avgRating' }
        }
      }
    ]);

    // 3. Category Performance (Events)
    const categoryStats = await Event.aggregate([
      { $unwind: '$attendees' },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 3.5 Group Analytics
    const groupEngagement = await Event.aggregate([
      { $unwind: '$attendees' },
      {
        $group: {
          _id: null,
          groupParticipants: { $sum: { $cond: [{ $ifNull: ['$attendees.groupId', false] }, 1, 0] } },
          individualParticipants: { $sum: { $cond: [{ $ifNull: ['$attendees.groupId', false] }, 0, 1] } },
          totalGroups: { $addToSet: '$attendees.groupId' }
        }
      },
      {
        $project: {
          groupParticipants: 1,
          individualParticipants: 1,
          totalGroupsCount: { $size: { $filter: { input: '$totalGroups', as: 'g', cond: { $ne: ['$$g', null] } } } }
        }
      }
    ]);

    const workshopGroupEngagement = await Workshop.aggregate([
      { $unwind: '$attendees' },
      {
        $group: {
          _id: null,
          groupParticipants: { $sum: { $cond: [{ $ifNull: ['$attendees.groupId', false] }, 1, 0] } },
          individualParticipants: { $sum: { $cond: [{ $ifNull: ['$attendees.groupId', false] }, 0, 1] } },
          totalGroups: { $addToSet: '$attendees.groupId' }
        }
      },
      {
        $project: {
          groupParticipants: 1,
          individualParticipants: 1,
          totalGroupsCount: { $size: { $filter: { input: '$totalGroups', as: 'g', cond: { $ne: ['$$g', null] } } } }
        }
      }
    ]);

    // 4. Daily Trends (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTrends = await Event.aggregate([
      { $unwind: '$attendees' },
      { $match: { 'attendees.registeredAt': { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$attendees.registeredAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 5. Recent Activity Feed
    // We'll pull recent registrations and recent creations
    const recentEventRegs = await Event.aggregate([
      { $unwind: '$attendees' },
      { $sort: { 'attendees.registeredAt': -1 } },
      { $limit: 10 },
      {
        $project: {
          type: { $literal: 'registration' },
          message: { $concat: ['$attendees.fullName', ' registered for "', '$title', '"'] },
          time: '$attendees.registeredAt'
        }
      }
    ]);

    const recentWorkshopRegs = await Workshop.aggregate([
      { $unwind: '$attendees' },
      { $sort: { 'attendees.registeredAt': -1 } },
      { $limit: 10 },
      {
        $project: {
          type: { $literal: 'registration' },
          message: { $concat: ['$attendees.fullName', ' registered for "', '$title', '"'] },
          time: '$attendees.registeredAt'
        }
      }
    ]);

    const recentEventCreations = await Event.find().sort({ createdAt: -1 }).limit(5).select('title createdAt');
    const recentWorkshopCreations = await Workshop.find().sort({ createdAt: -1 }).limit(5).select('title createdAt');
    
    const creations = [
      ...recentEventCreations.map(e => ({
        type: 'event_created',
        message: `New Event: "${e.title}" published`,
        time: e.createdAt
      })),
      ...recentWorkshopCreations.map(w => ({
        type: 'workshop_created',
        message: `New Workshop: "${w.title}" published`,
        time: w.createdAt
      }))
    ];

    const recentActivity = [...recentEventRegs, ...recentWorkshopRegs, ...creations]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 20);

    res.json({
      summary: {
        totalStudents,
        totalEvents,
        totalWorkshops,
        totalRegistrations: (eventStats[0]?.totalRegistrations || 0) + (workshopStats[0]?.totalRegistrations || 0),
        totalAttendance: (eventStats[0]?.totalAttendance || 0) + (workshopStats[0]?.totalAttendance || 0),
        avgGlobalRating: ((eventStats[0]?.avgEventRating || 0) + (workshopStats[0]?.avgWorkshopRating || 0)) / 2
      },
      categoryPerformance: categoryStats,
      dailyTrends,
      recentActivity,
      groupEngagement: {
        totalGroups: (groupEngagement[0]?.totalGroupsCount || 0) + (workshopGroupEngagement[0]?.totalGroupsCount || 0),
        groupParticipants: (groupEngagement[0]?.groupParticipants || 0) + (workshopGroupEngagement[0]?.groupParticipants || 0),
        individualParticipants: (groupEngagement[0]?.individualParticipants || 0) + (workshopGroupEngagement[0]?.individualParticipants || 0)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during analytics aggregation' });
  }
});

// @route   GET /api/analytics/activity
// Provides a more comprehensive list of recent activities
router.get('/activity', protect, admin, async (req, res) => {
  try {
    const recentEventRegs = await Event.aggregate([
      { $unwind: '$attendees' },
      { $sort: { 'attendees.registeredAt': -1 } },
      { $limit: 100 },
      {
        $project: {
          type: { $literal: 'registration' },
          message: { $concat: ['$attendees.fullName', ' registered for "', '$title', '"'] },
          time: '$attendees.registeredAt'
        }
      }
    ]);

    const recentWorkshopRegs = await Workshop.aggregate([
      { $unwind: '$attendees' },
      { $sort: { 'attendees.registeredAt': -1 } },
      { $limit: 100 },
      {
        $project: {
          type: { $literal: 'registration' },
          message: { $concat: ['$attendees.fullName', ' registered for "', '$title', '"'] },
          time: '$attendees.registeredAt'
        }
      }
    ]);

    const recentEventCreations = await Event.find().sort({ createdAt: -1 }).limit(50).select('title createdAt');
    const recentWorkshopCreations = await Workshop.find().sort({ createdAt: -1 }).limit(50).select('title createdAt');

    const creations = [
      ...recentEventCreations.map(e => ({
        type: 'event_created',
        message: `New Event: "${e.title}" published`,
        time: e.createdAt
      })),
      ...recentWorkshopCreations.map(w => ({
        type: 'workshop_created',
        message: `New Workshop: "${w.title}" published`,
        time: w.createdAt
      }))
    ];

    const fullActivity = [...recentEventRegs, ...recentWorkshopRegs, ...creations]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 100);

    res.json(fullActivity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during activity fetch' });
  }
});

export default router;
