const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const users = require('../mockData/users');

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });
  
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      avatar: user.avatar
    }
  });
});

// Get current user
router.get('/user', (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(user => user.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      avatar: user.avatar
    });
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ msg: 'Logged out successfully' });
});

module.exports = router;