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
    category: {
      type: String,
      required: true,
      enum: ['technical', 'cultural', 'sports', 'seminar', 'workshop', 'competition', 'other'],
      default: 'technical',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    attendees: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        qrToken: { type: String, unique: true, sparse: true },
        fullName: { type: String },
        usn: { type: String },
        manualEntry: { type: Boolean, default: false },
        attended: { type: Boolean, default: false },
        attendedAt: { type: Date },
        registeredAt: { type: Date, default: Date.now },
        groupId: { type: String },
        isGroupLeader: { type: Boolean, default: false },
        paymentScreenshot: { type: String, default: '' },
        paymentStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'n/a'], default: 'n/a' },
        invitationStatus: { type: String, enum: ['accepted', 'pending', 'declined'], default: 'accepted' },
      },
    ],
    capacity: {
      type: Number,
      default: 100,
    },
    maxGroupSize: {
      type: Number,
      default: 1,
    },
    banner: {
      type: String,
      default: '', // Cloudinary URL
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    fee: {
      type: Number,
      default: 0,
    },
    paymentQR: {
      type: String,
      default: '', // Cloudinary URL
    },
    whatsappLink: {
      type: String,
      default: '',
    },
    feedbackOpened: {
      type: Boolean,
      default: false,
    },
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

eventSchema.index({ date: 1 });
eventSchema.index({ branch: 1 });
eventSchema.index({ category: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;