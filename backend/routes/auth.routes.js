import express from 'express';
import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts
  message: 'Too many authentication attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', authLimiter, async (req, res) => {
  const { 
    username,
    fullName,
    email, 
    password,
    usn,
    branch,
    year,
    semester,
    role,        // New: Accept role from client
    secretCode,   // New: Secret code for admin
    phoneNumber   // New: Phone number support
  } = req.body;

  const finalUsername = username || fullName || email.split('@')[0];

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Role validation
    let finalRole = 'user';
    if (role === 'admin') {
      if (secretCode === 'NP18') {
        finalRole = 'admin';
      } else {
        return res.status(403).json({ message: 'Invalid administrative secret code' });
      }
    }

    // Optional: Check if USN already exists (only for students)
    if (finalRole === 'user' && usn) {
      const usnExists = await User.findOne({ 'profile.usn': usn });
      if (usnExists) {
        return res.status(400).json({ message: 'USN already registered' });
      }
    }

    // --- 2. CREATE THE USER WITH THE FULL PROFILE ---
    const user = await User.create({
      username: finalUsername,
      email,
      password,
      role: finalRole, // Set the validated role
      profile: {
        fullName: fullName || finalUsername,
        usn: finalRole === 'admin' ? `ADM-${email.split('@')[0]}` : usn,
        branch: finalRole === 'admin' ? 'MANAGEMENT' : branch,
        year: finalRole === 'admin' ? 'N/A' : year,
        semester: finalRole === 'admin' ? 'N/A' : semester,
        phoneNumber: phoneNumber || ''
      }
    });
    // --- END CHANGE ---

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile, // Send the full profile back
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', authLimiter, async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or phoneNumber
  try {
    const user = await User.findOne({ 
      $or: [
        { email: identifier },
        { 'profile.phoneNumber': identifier }
      ]
    });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile, // Send profile on login
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

export default router;