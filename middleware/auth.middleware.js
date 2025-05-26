const jwt = require('jsonwebtoken');
const users = require('../mockData/users');

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

exports.authenticateUser = (req, res, next) => {
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

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  next();
};

exports.isHR = (req, res, next) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ msg: 'Access denied. HR only.' });
  }
  next();
};

exports.isAdminOrHR = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'hr') {
    return res.status(403).json({ msg: 'Access denied. Admin or HR only.' });
  }
  next();
};