const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth.middleware');
const attendance = require('../mockData/attendance');

// Get attendance records
router.get('/', authenticateUser, (req, res) => {
  let userAttendance = attendance;
  
  // If not admin, only show user's own attendance
  if (req.user.role !== 'admin') {
    userAttendance = attendance.filter(record => record.userId === req.user.id);
  }
  
  res.json(userAttendance);
});

// Check in
router.post('/check-in', authenticateUser, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if already checked in today
  const existingRecord = attendance.find(
    record => record.userId === req.user.id && record.date.startsWith(today)
  );
  
  if (existingRecord) {
    return res.status(400).json({ msg: 'Already checked in today' });
  }
  
  const newRecord = {
    id: (attendance.length + 1).toString(),
    userId: req.user.id,
    date: new Date().toISOString(),
    checkIn: new Date().toISOString(),
    location: req.body.location
  };
  
  attendance.push(newRecord);
  res.status(201).json(newRecord);
});

// Check out
router.post('/check-out', authenticateUser, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const recordIndex = attendance.findIndex(
    record => record.userId === req.user.id && 
    record.date.startsWith(today) && 
    !record.checkOut
  );
  
  if (recordIndex === -1) {
    return res.status(400).json({ msg: 'No active check-in found' });
  }
  
  attendance[recordIndex].checkOut = new Date().toISOString();
  attendance[recordIndex].location = {
    ...attendance[recordIndex].location,
    checkOut: req.body.location
  };
  
  res.json(attendance[recordIndex]);
});

module.exports = router;