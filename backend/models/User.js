const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  // Basic Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  secondaryEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },  
  // Role & Permissions
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'organizer', 'participant', 'guest', 'faculty_coordinator'],
    default: 'participant'
  },
  permissions: [{
    type: String
  }],
  
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  staffId: {
    type: String,
    unique: true,
    sparse: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  
  // Profile Picture
  profilePicture: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },

  linkedIn: {type: String, default: ''},
  
  // Academic Details
  department: {
    type: String,
    required: true
  },

  course: String,
  program: String,
  yearOfStudy: {
    type: Number,
    min: 1,
    max: 4
  },
  batch: String,
  rollNumber: String,
  
  // Activity Tracking
  eventsAttended: [{
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event'
    },
    attendedAt: Date,
    certificateIssued: Boolean,
    certificateUrl: String
  }],

  eventsOrganized: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }],
  
  // Privacy Settings
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'members_only', 'private'],
      default: 'public'
    },
    contactVisibility: {
      type: String,
      enum: ['public', 'members_only', 'private'],
      default: 'members_only'
    },
    activityVisibility: {
      type: String,
      enum: ['public', 'members_only', 'private'],
      default: 'public'
    },
    allowMessages: {
      type: String,
      enum: ['anyone', 'members', 'organizers', 'none'],
      default: 'members'
    }
  },
  
  // Profile Completion
  profileCompletionPercentage: {
    type: Number,
    default: 0
  },
  isProfileVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Account Management
  lastLogin: Date,
  lastPasswordChange: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for User Schema
UserSchema.index({ email: 1 });
UserSchema.index({ studentId: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ accountStatus: 1 });

// ============================================================================

// OTP Schema (for email verification)
const OTPSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['email_verification', 'password_reset', '2fa'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto-delete after 10 minutes
  }
});

OTPSchema.index({ email: 1, purpose: 1 });
OTPSchema.index({ expiresAt: 1 });