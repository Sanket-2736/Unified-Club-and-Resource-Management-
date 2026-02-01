const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};
