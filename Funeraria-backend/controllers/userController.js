const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const FuneralHome = require('../models/FuneralHome');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

async function register(req, res) {
  try {
    const { name, email, password, role, address, city, judet } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email și parola sunt obligatorii.' });
    }
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email deja folosit.' });
    }
    const user = await userService.createUser({ name, email, password, role, address, city, judet });
    let funeralHomeId = null;
    if (user.role === 'funeral_home') {
      const funeralHome = await FuneralHome.findOne({ where: { userId: user.id } });
      if (funeralHome) funeralHomeId = funeralHome.id;
    }
    const token = jwt.sign({ id: user.id, role: user.role, funeralHomeId }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        city: user.city,
        judet: user.judet,
        funeralHomeId,
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Eroare la înregistrare.', error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email și parola sunt obligatorii.' });
    }
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email sau parolă incorecte.' });
    }
    const valid = await userService.validatePassword(user, password);
    if (!valid) {
      return res.status(401).json({ message: 'Email sau parolă incorecte.' });
    }
    let funeralHomeId = null;
    if (user.role === 'funeral_home') {
      const funeralHome = await FuneralHome.findOne({ where: { userId: user.id } });
      if (funeralHome) funeralHomeId = funeralHome.id;
    }
    const token = jwt.sign({ id: user.id, role: user.role, funeralHomeId }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, funeralHomeId } });
  } catch (err) {
    return res.status(500).json({ message: 'Eroare la autentificare.', error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, password, address, city, judet } = req.body;
    if (!name && !password && !address && !city && !judet) {
      return res.status(400).json({ message: 'Trimite date pentru actualizare.' });
    }
    const user = await userService.updateUser(userId, { name, password, address, city, judet });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, address: user.address, city: user.city, judet: user.judet });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la actualizare profil.', error: err.message });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email obligatoriu.' });
    const token = await userService.forgotPassword(email);
    if (!token) return res.status(404).json({ message: 'Nu există user cu acest email.' });
    // În MVP, returnăm tokenul direct (în realitate, s-ar trimite pe email)
    res.json({ message: 'Token generat. Folosește-l pentru resetare.', token });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la generare token.', error: err.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token și parolă obligatorii.' });
    const ok = await userService.resetPassword(token, password);
    if (!ok) return res.status(400).json({ message: 'Token invalid sau expirat.' });
    res.json({ message: 'Parolă resetată cu succes.' });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la resetare parolă.', error: err.message });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Parola veche și nouă sunt obligatorii.' });
    }
    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit.' });
    }
    const valid = await userService.validatePassword(user, oldPassword);
    if (!valid) {
      return res.status(401).json({ message: 'Parola veche este incorectă.' });
    }
    await userService.updateUser(userId, { password: newPassword });
    res.json({ message: 'Parola a fost schimbată cu succes.' });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la schimbarea parolei.', error: err.message });
  }
}

module.exports = { register, login, updateProfile, forgotPassword, resetPassword, changePassword }; 