const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const users = require('../mockData/users');

// Get all users
router.get('/', authenticateUser, (req, res) => {
  const usersList = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    position: user.position,
    joinDate: user.joinDate,
    avatar: user.avatar
  }));
  
  res.json(usersList);
});

// Get user profile
router.get('/profile', authenticateUser, (req, res) => {
  const user = users.find(user => user.id === req.user.id);
  res.json(user);
});

// Update user profile
router.put('/profile', authenticateUser, (req, res) => {
  const userIndex = users.findIndex(user => user.id === req.user.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ msg: 'User not found' });
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(users[userIndex]);
});

module.exports = router;