const crypto = require("crypto");
const User = require("../models/User");
const { comparePassword } = require("../utils/password");

/**
 * ======================================================
 * HELPER: Find user by email OR rollNumber
 * ======================================================
 */
const findUserByIdentifier = async ({ email, rollNumber }) => {
  if (!email && !rollNumber) {
    throw new Error("Email or rollNumber is required");
  }

  const query = {};
  if (email) query.email = email.toLowerCase();
  if (rollNumber) query.rollNumber = rollNumber;

  const user = await User.findOne(query);
  return user;
};

/**
 * ======================================================
 * USER MANAGEMENT (ADMIN)
 * ======================================================
 */

/**
 * 1. View all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -passwordResetToken -emailVerificationToken")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Activate / Deactivate user
 */
exports.toggleUserActiveStatus = async (req, res) => {
  try {
    const { email, rollNumber, isActive } = req.body;

    const user = await findUserByIdentifier({ email, rollNumber });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * 3. Assign role (EXCEPT super_admin)
 */
exports.assignUserRole = async (req, res) => {
  try {
    const { email, rollNumber, role } = req.body;

    if (role === "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot assign super_admin role" });
    }

    const user = await findUserByIdentifier({ email, rollNumber });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.role === "super_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot modify super_admin" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Delete all students from a particular batch
 */
exports.deleteUsersByBatch = async (req, res) => {
  try {
    const { batch } = req.body;

    if (!batch) {
      return res.status(400).json({
        success: false,
        message: "Batch is required",
      });
    }

    const result = await User.deleteMany({
      batch,
      role: "participant", // safeguard: only students
    });
    const message = `Deleted ${result.deletedCount} students from batch ${batch}`
    res.status(200).json({
      success: true,
      message: message,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a single user (by email or rollNumber)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { email, rollNumber } = req.body;

    if (!email && !rollNumber) {
      return res.status(400).json({
        success: false,
        message: "Email or rollNumber is required",
      });
    }

    const query = {};
    if (email) query.email = email.toLowerCase();
    if (rollNumber) query.rollNumber = rollNumber;

    const user = findUserByIdentifier({ email, rollNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete super_admin",
      });
    }

    await User.deleteOne({ _id: user._id });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;   
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (email !== adminEmail) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await comparePassword(password, adminPasswordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            id: 'admin_id',
            role: 'admin'
        };

        const accessToken = generateAccessToken(payload);

        res.status(200).json({
            message: 'Admin login successful',
            accessToken
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || !userIds.length) {
      return res.status(400).json({ message: 'userIds array required' });
    }

    const result = await User.deleteMany({
      _id: { $in: userIds },
      role: { $ne: 'super_admin' }
    });

    res.json({
      message: 'Users deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
