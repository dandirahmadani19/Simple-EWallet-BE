// File: utils/jwt.js
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

exports.generateToken = (payload, expiresIn = '1d') => {
  return jwt.sign(payload, secret, { expiresIn });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};
