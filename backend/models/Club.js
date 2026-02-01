const mongoose = require('mongoose');

const ClubSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tagline: {
    type: String,
    maxlength: 200
  },
  description: {
    type: String,
    required: true
  },
  missionStatement: String,
  
  // Categorization
  category: [{
    type: String,
    enum: ['cultural', 'technical', 'sports', 'social_service', 'academic', 'arts', 'entrepreneurship', 'other'],
    required: true
  }],
  tags: [{
    type: String
  }],
  
  // Media
  logo: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  coverImage: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  gallery: [{
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    publicId: String,
    caption: String,
    uploadedAt: Date,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Contact & Social
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: String,
  socialLinks: {
    website: {type : String, default: ''},
    instagram: String,
    linkedin: String,
  },
  
  // Founding & Status
  foundingDate: {type: Date, default: ''},
  status: {
    type: String,
    enum: [ 'active', 'inactive'],
    default: 'pending'
  },
  
  // Membership
  membershipType: {
    type: String,
    enum: ['open', 'closed', 'invitation_only'],
    default: 'open'
  },

  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['president', 'vice_president', 'faculty_coordinator', 'secretary', 'treasurer', 'event_coordinator', 'marketing_head', 'technical_lead', 'core_committee'],
      default: 'general_member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    probationPeriod: {
      status: {
        type: String,
        enum: ['active', 'completed', 'failed']
      },
      startDate: Date,
      endDate: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    leftAt: Date,
    leftReason: String
  }],
  
  // Statistics
  totalMembers: {
    type: Number,
    default: 0
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  
  // Achievements
  achievements: [{
    title: String,
    description: String,
    achievedAt: Date,
    category: String,
    proof: {
      type: String
    }
  }],
  
  // Approval Workflow
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'changes_requested'],
    default: 'pending'
  },  
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

ClubSchema.index({ name: 1 });
ClubSchema.index({ category: 1 });
module.exports = mongoose.model('Club', ClubSchema);