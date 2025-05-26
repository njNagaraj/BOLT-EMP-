const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin, isHR } = require('../middleware/auth.middleware');
const leaves = require('../mockData/leaves');

// Get all leaves based on user role
router.get('/', authenticateUser, (req, res) => {
  if (req.user.role === 'admin') {
    // Admin sees all HR approved leaves
    const hrApprovedLeaves = leaves.filter(leave => leave.hrApproved);
    res.json(hrApprovedLeaves);
  } else if (req.user.role === 'hr') {
    // HR sees all pending leaves
    const pendingLeaves = leaves.filter(leave => !leave.hrApproved);
    res.json(pendingLeaves);
  } else {
    // Employees see their own leaves
    const userLeaves = leaves.filter(leave => leave.userId === req.user.id);
    res.json(userLeaves);
  }
});

// Submit new leave request
router.post('/', authenticateUser, (req, res) => {
  const newLeave = {
    id: (leaves.length + 1).toString(),
    userId: req.user.id,
    reason: req.body.reason,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    status: 'pending',
    hrApproved: false,
    createdAt: new Date().toISOString()
  };
  
  leaves.push(newLeave);
  res.status(201).json(newLeave);
});

// HR approval/rejection
router.put('/:id/hr', authenticateUser, isHR, (req, res) => {
  const leaveId = req.params.id;
  const leaveIndex = leaves.findIndex(leave => leave.id === leaveId);
  
  if (leaveIndex === -1) {
    return res.status(404).json({ msg: 'Leave not found' });
  }
  
  leaves[leaveIndex].hrApproved = req.body.approved;
  leaves[leaveIndex].hrComment = req.body.comment;
  leaves[leaveIndex].hrUpdatedAt = new Date().toISOString();
  
  if (!req.body.approved) {
    leaves[leaveIndex].status = 'rejected';
  }
  
  res.json(leaves[leaveIndex]);
});

// Admin final approval/rejection
router.put('/:id/admin', authenticateUser, isAdmin, (req, res) => {
  const leaveId = req.params.id;
  const leaveIndex = leaves.findIndex(leave => leave.id === leaveId);
  
  if (leaveIndex === -1) {
    return res.status(404).json({ msg: 'Leave not found' });
  }
  
  if (!leaves[leaveIndex].hrApproved) {
    return res.status(400).json({ msg: 'Leave must be approved by HR first' });
  }
  
  leaves[leaveIndex].status = req.body.status;
  leaves[leaveIndex].adminComment = req.body.comment;
  leaves[leaveIndex].updatedAt = new Date().toISOString();
  
  res.json(leaves[leaveIndex]);
});

module.exports = router;