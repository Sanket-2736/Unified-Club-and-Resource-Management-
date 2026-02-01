const User = require('../models/User');
const { comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const { hashPassword } = require('../utils/password');

exports.signup = async (req, res) => {
  try {
    const {
      // auth
      email,
      secondaryEmail,
      password,

      // role
      role,
      permissions,

      // basic info
      firstName,
      lastName,
      phoneNumber,
      linkedIn,

      // academic
      department,
      course,
      program,
      yearOfStudy,
      batch,
      rollNumber,
      studentId,
      staffId
    } = req.body;

    // required checks
    if (!email || !password || !firstName || !lastName || !department) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      secondaryEmail,
      password: hashedPassword,
      role,
      permissions,

      firstName,
      lastName,
      phoneNumber,
      linkedIn,

      department,
      course,
      program,
      yearOfStudy,
      batch,
      rollNumber,
      studentId,
      staffId
    });

    const payload = {
      id: user._id,
      role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      message: 'Signup successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Signup failed',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id,
      role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = rememberMe ? generateRefreshToken(payload) : null;

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
};
