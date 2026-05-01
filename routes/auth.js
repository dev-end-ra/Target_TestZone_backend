import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

// Helper: Build safe user response object
const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  studentId: user.studentId || null,
  targetExam: user.targetExam || null,
  phone: user.phone || null,
});

// 1. Standard Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: buildUserResponse(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. Standard Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.password) {
      return res.status(400).json({ message: 'Please login using Google' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: buildUserResponse(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. Google Login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const googlePayload = ticket.getPayload();
    const { email, name, sub: googleId } = googlePayload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = new User({ name, email, googleId });
      await user.save();
    }

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: buildUserResponse(user) });
  } catch (error) {
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
});

export default router;
