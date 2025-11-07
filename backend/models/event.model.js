import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
      enum: [
        'cse',
        'ise',
        'aiml',
        'ec',
        'eee',
        'civil',
        'mechanical',
        'general',
      ],
      default: 'general',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // --- ADD THIS ---
    feedback: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ]
    // --- END ADD ---
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;