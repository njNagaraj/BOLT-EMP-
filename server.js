const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const users = require('./mockData/users');
const tasks = require('./mockData/tasks');
const attendance = require('./mockData/attendance');
const leaves = require('./mockData/leaves');

const app = express();
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

const authenticateUser = (req, res, next) => {
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
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    return res.status(400).json({ msg: 'Invalid Credentials' });
  }
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      skills: user.skills
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ msg: 'Logged out successfully' });
});

app.get('/api/auth/user', authenticateUser, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
    phone: req.user.phone,
    address: req.user.address,
    bio: req.user.bio,
    skills: req.user.skills
  });
});

// Get user profile
app.get('/api/users/profile', authenticateUser, (req, res) => {
  const { password, ...userProfile } = req.user;
  res.json(userProfile);
});

// Update user profile
app.put('/api/users/profile', authenticateUser, (req, res) => {
  const { name, phone, address, bio, skills } = req.body;
  
  const userIndex = users.findIndex(user => user.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ msg: 'User not found' });
  }
  
  users[userIndex] = {
    ...users[userIndex],
    name,
    phone,
    address,
    bio,
    skills
  };
  
  const { password, ...updatedUser } = users[userIndex];
  res.json(updatedUser);
});

// User routes
app.get('/api/users', authenticateUser, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized' });
  }
  
  res.json(users.map(({ password, ...user }) => user));
});

app.post('/api/users', authenticateUser, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized to create users' });
  }

  const { name, email, password, department, position } = req.body;

  if (users.find(user => user.email === email)) {
    return res.status(400).json({ msg: 'User with this email already exists' });
  }

  const newUser = {
    id: (users.length + 1).toString(),
    name,
    email,
    password,
    role: 'employee',
    department,
    position,
    joinDate: new Date().toISOString(),
    avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${users.length + 1}.jpg`
  };

  users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// Tasks routes
app.get('/api/tasks', authenticateUser, (req, res) => {
  if (req.user.role === 'admin') {
    res.json(tasks);
  } else {
    const userTasks = tasks.filter(task => task.assignedTo === req.user.id);
    res.json(userTasks);
  }
});

app.post('/api/tasks', authenticateUser, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized to create tasks' });
  }
  
  const newTask = {
    id: (tasks.length + 1).toString(),
    title: req.body.title,
    description: req.body.description,
    status: req.body.status || 'pending',
    priority: req.body.priority || 'medium',
    assignedTo: req.body.assignedTo,
    createdAt: new Date().toISOString(),
    dueDate: req.body.dueDate
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', authenticateUser, (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ msg: 'Task not found' });
  }
  
  if (req.user.role !== 'admin' && tasks[taskIndex].assignedTo !== req.user.id) {
    return res.status(403).json({ msg: 'Not authorized to update this task' });
  }
  
  const updatedTask = {
    ...tasks[taskIndex],
    ...req.body,
    assignedTo: req.user.role === 'admin' ? req.body.assignedTo : tasks[taskIndex].assignedTo
  };
  
  tasks[taskIndex] = updatedTask;
  res.json(updatedTask);
});

// Attendance routes
app.get('/api/attendance', authenticateUser, (req, res) => {
  if (req.user.role === 'admin') {
    res.json(attendance);
  } else {
    const userAttendance = attendance.filter(record => record.userId === req.user.id);
    res.json(userAttendance);
  }
});

app.post('/api/attendance/check-in', authenticateUser, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const existingRecord = attendance.find(
    record => record.userId === req.user.id && record.date.startsWith(today)
  );
  
  if (existingRecord && existingRecord.checkIn && !existingRecord.checkOut) {
    return res.status(400).json({ msg: 'Already checked in today' });
  }
  
  const newAttendance = {
    id: (attendance.length + 1).toString(),
    userId: req.user.id,
    date: new Date().toISOString(),
    checkIn: new Date().toISOString(),
    checkOut: null,
    location: req.body.location
  };
  
  attendance.push(newAttendance);
  res.status(201).json(newAttendance);
});

app.post('/api/attendance/check-out', authenticateUser, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const recordIndex = attendance.findIndex(
    record => record.userId === req.user.id && record.date.startsWith(today) && record.checkIn && !record.checkOut
  );
  
  if (recordIndex === -1) {
    return res.status(400).json({ msg: 'No active check-in found' });
  }
  
  attendance[recordIndex] = {
    ...attendance[recordIndex],
    checkOut: new Date().toISOString(),
    checkOutLocation: req.body.location
  };
  
  res.json(attendance[recordIndex]);
});

// Leave routes
app.get('/api/leaves', authenticateUser, (req, res) => {
  if (req.user.role === 'admin') {
    res.json(leaves);
  } else {
    const userLeaves = leaves.filter(leave => leave.userId === req.user.id);
    res.json(userLeaves);
  }
});

app.post('/api/leaves', authenticateUser, (req, res) => {
  const newLeave = {
    id: (leaves.length + 1).toString(),
    userId: req.user.id,
    reason: req.body.reason,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  leaves.push(newLeave);
  res.status(201).json(newLeave);
});

app.put('/api/leaves/:id', authenticateUser, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized to approve/reject leaves' });
  }
  
  const leaveId = req.params.id;
  const leaveIndex = leaves.findIndex(leave => leave.id === leaveId);
  
  if (leaveIndex === -1) {
    return res.status(404).json({ msg: 'Leave not found' });
  }
  
  leaves[leaveIndex].status = req.body.status;
  leaves[leaveIndex].updatedAt = new Date().toISOString();
  
  res.json(leaves[leaveIndex]);
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));