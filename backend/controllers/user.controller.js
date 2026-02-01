const User = require('../models/User');
const { comparePassword, hashPassword } = require('../utils/password');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -passwordResetToken -emailVerificationToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'secondaryEmail',
      'firstName',
      'lastName',
      'phoneNumber',
      'linkedIn',

      'department',
      'course',
      'program',
      'yearOfStudy',
      'batch',
      'rollNumber',

      'privacySettings'
    ];

    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Profile update failed',
      error: error.message
    });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email, prevPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if(!comparePassword(prevPassword, user.password)) {
        return res.status(400).json({ message: 'Previous password is incorrect' });
    }

    const hashedPass = await hashPassword(newPassword);
    user.password = hashedPass;
    await user.save();

    res.status(200).json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to request password reset',
      error: error.message
    });
  }
};
