const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/auth.middleware');
const tasks = require('../mockData/tasks');

// Get all tasks
router.get('/', authenticateUser, (req, res) => {
  const { assignedTo } = req.query;
  
  let filteredTasks = tasks;
  if (assignedTo) {
    filteredTasks = tasks.filter(task => task.assignedTo === assignedTo);
  }
  
  res.json(filteredTasks);
});

// Create new task
router.post('/', authenticateUser, isAdmin, (req, res) => {
  const newTask = {
    id: (tasks.length + 1).toString(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update task status
router.put('/:id', authenticateUser, (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ msg: 'Task not found' });
  }
  
  // Only allow status update if user is assigned to the task or is admin
  if (tasks[taskIndex].assignedTo !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized to update this task' });
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(tasks[taskIndex]);
});

module.exports = router;