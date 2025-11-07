import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './db.js';
import User from './models/user.model.js';
import Event from './models/event.model.js';
import Workshop from './models/workshop.model.js'; // <-- 1. IMPORT WORKSHOP MODEL

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Clear existing data
    await Event.deleteMany();
    await Workshop.deleteMany(); // <-- 2. CLEAR WORKSHOPS

    // 2. Find an admin user
    const creator = await User.findOne({ role: 'admin' });

    if (!creator) {
      console.error('Error: No admin user found in database.');
      console.log('Please register a user and set role: "admin" in MongoDB, then re-run.');
      process.exit(1);
    }
    
    console.log(`Using admin "${creator.username}" as event creator.`);

    // 3. Define 3 sample events
    const sampleEvents = [
      {
        title: 'CSE Tech Talk: The Future of AI',
        description: 'A guest lecture by industry experts on the rapid advancement of AI.',
        date: '2025-11-20T14:00:00Z',
        location: 'Main Auditorium',
        branch: 'cse',
        creator: creator._id,
      },
      {
        title: 'Civil Engineering Expo 2025',
        description: 'Showcase of the latest in sustainable infrastructure and design.',
        date: '2025-11-22T10:00:00Z',
        location: 'Civil Dept. Quad',
        branch: 'civil',
        creator: creator._id,
      },
      {
        title: 'College Fest "Verdant 2025"',
        description: 'The annual inter-college cultural festival. All are welcome!',
        date: '2025-11-28T09:00:00Z',
        location: 'College Grounds',
        branch: 'general',
        creator: creator._id,
      },
    ];

    // 4. Define 2 sample workshops
    const sampleWorkshops = [
      {
        title: 'Hands-on IoT Workshop with Raspberry Pi',
        description: 'A 2-day workshop on building and programming IoT devices.',
        date: '2025-11-18T09:30:00Z',
        location: 'EC Lab 3',
        branch: 'ec',
        creator: creator._id,
      },
      {
        title: 'Agile & Scrum Project Management',
        description: 'Learn the fundamentals of agile methodologies for a career in tech.',
        date: '2025-11-24T11:00:00Z',
        location: 'ISE Seminar Hall',
        branch: 'ise',
        creator: creator._id,
      },
    ];

    // 5. Insert all data
    await Event.insertMany(sampleEvents);
    await Workshop.insertMany(sampleWorkshops); // <-- 3. INSERT WORKSHOPS

    console.log('Data Imported Successfully! 3 events and 2 workshops added.');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

// We call the function to run it
importData();