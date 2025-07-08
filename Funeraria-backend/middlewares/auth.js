const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token lipsă' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalid' });
  }
}

function requireFuneralHomeRole(req, res, next) {
  if (req.user.role !== 'funeral_home') {
    return res.status(403).json({ message: 'Acces interzis. Doar casele funerare au acces.' });
  }
  next();
}

function requireAdminRole(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acces permis doar pentru admin.' });
  }
  next();
}

function requireUserRole(req, res, next) {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Acces permis doar pentru user normal.' });
  }
  next();
}

module.exports = { authenticateJWT, requireFuneralHomeRole, requireAdminRole, requireUserRole }; 