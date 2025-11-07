import mongoose from 'mongoose';

// This schema is identical to the eventSchema
const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    branch: {
      type: String,
      required: true,
      enum: ['cse', 'ise', 'aiml', 'ec', 'eee', 'civil', 'mechanical', 'general'],
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
    feedback: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const Workshop = mongoose.model('Workshop', workshopSchema);
export default Workshop;