const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createUser({ name, email, password, role, address, city, judet }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return User.create({ name, email, password: hashedPassword, role, address, city, judet });
}

async function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function validatePassword(user, password) {
  return bcrypt.compare(password, user.password);
}

async function updateUser(id, { name, password, address, city, judet }) {
  const updateData = {};
  if (name) updateData.name = name;
  if (address !== undefined) updateData.address = address;
  if (city !== undefined) updateData.city = city;
  if (judet !== undefined) updateData.judet = judet;
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateData.password = hashedPassword;
  }
  await User.update(updateData, { where: { id } });
  return User.findByPk(id, { attributes: { exclude: ['password'] } });
}

async function forgotPassword(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) return null;
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 oră
  await user.update({ resetPasswordToken: token, resetPasswordExpires: expires });
  return token;
}

async function resetPassword(token, newPassword) {
  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [require('sequelize').Op.gt]: new Date() },
    },
  });
  if (!user) return false;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null });
  return true;
}

async function findById(id) {
  return User.findByPk(id);
}

module.exports = {
  createUser,
  findByEmail,
  validatePassword,
  updateUser,
  forgotPassword,
  resetPassword,
  findById,
}; 