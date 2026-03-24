import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from './models/user.model.js';
import Event from './models/event.model.js';
import Workshop from './models/workshop.model.js';

const MONGO_URI = process.env.MONGO_URI;

async function cleanup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const admins = await User.find({ role: 'admin' });
    const adminIds = admins.map(admin => admin._id);

    console.log(`Found ${admins.length} admins:`, admins.map(a => a.username));
    
    const adminUsns = admins
      .map(a => a.profile?.usn)
      .filter(u => !!u)
      .map(u => u.toUpperCase());

    // Remove admins from events
    const eventResult = await Event.updateMany(
      {},
      { 
        $pull: { 
          attendees: { 
            $or: [
              { user: { $in: adminIds } },
              { usn: { $in: adminUsns } }
            ]
          } 
        } 
      }
    );
    console.log(`Removed admins from ${eventResult.modifiedCount} events`);

    // Remove admins from workshops
    const workshopResult = await Workshop.updateMany(
      {},
      { 
        $pull: { 
          attendees: { 
            $or: [
              { user: { $in: adminIds } },
              { usn: { $in: adminUsns } }
            ]
          } 
        } 
      }
    );
    console.log(`Removed admins from ${workshopResult.modifiedCount} workshops`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanup();
