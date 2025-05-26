const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/auth.middleware');
const announcements = require('../mockData/announcements');

// Get active announcements
router.get('/', authenticateUser, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const activeAnnouncements = announcements.filter(
    announcement => 
      announcement.startDate <= today && 
      announcement.endDate >= today
  );
  
  res.json(activeAnnouncements);
});

// Get all announcements (admin only)
router.get('/all', authenticateUser, isAdmin, (req, res) => {
  res.json(announcements);
});

// Create new announcement (admin only)
router.post('/', authenticateUser, isAdmin, (req, res) => {
  const newAnnouncement = {
    id: (announcements.length + 1).toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    createdBy: req.user.id
  };
  
  announcements.push(newAnnouncement);
  res.status(201).json(newAnnouncement);
});

module.exports = router;