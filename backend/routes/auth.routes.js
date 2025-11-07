import express from 'express';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper function to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  // --- 1. GET ALL THE NEW FIELDS FROM THE REQUEST ---
  const { 
    username, 
    email, 
    password,
    usn,
    branch,
    year,
    semester
  } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Optional: Check if USN already exists
    if (usn) {
      const usnExists = await User.findOne({ 'profile.usn': usn });
      if (usnExists) {
        return res.status(400).json({ message: 'USN already registered' });
      }
    }

    // --- 2. CREATE THE USER WITH THE FULL PROFILE ---
    const user = await User.create({
      username,
      email,
      password,
      profile: {
        fullName: username, // Default fullName to username
        usn,
        branch,
        year,
        semester
      }
    });
    // --- END CHANGE ---

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile, // Send the full profile back
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile, // Send profile on login
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