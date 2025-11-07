import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { // The user who will receive the notification
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
    },
    link: { // e.g., /events/cse
      type: String,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;