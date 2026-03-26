import express from 'express';
import User from '../models/user.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { generateOTP, sendEmailOTP } from '../utils/otp.utils.js';

const router = express.Router();

/**
 * @route   POST /api/otp/send-email
 * @desc    Generate and send OTP to user's email
 * @access  Private
 */
router.post('/send-email', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailOTP = otp;
    user.emailOTPExpires = otpExpires;
    await user.save();

    const emailSent = await sendEmailOTP(user.email, otp);
    if (emailSent) {
      res.status(200).json({ message: 'OTP sent to email' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

/**
 * @route   POST /api/otp/verify-email
 * @desc    Verify email OTP
 * @access  Private
 */
router.post('/verify-email', protect, async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: 'OTP is required' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailOTP !== otp || user.emailOTPExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully', isEmailVerified: true });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

export default router;
