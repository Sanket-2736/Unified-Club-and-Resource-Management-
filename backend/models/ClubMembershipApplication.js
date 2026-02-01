const mongoose = require('mongoose');

const ClubMembershipApplicationSchema = new Schema({
  clubId: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  applicantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application Details
  applicationForm: [{
    question: String,
    answer: String
  }],
  coverLetter: String,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  // Review
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  reviewedAt: Date,
  reviewComments: String,
  
  // Timestamps
  appliedAt: {
    type: Date,
    default: Date.now
  },
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

ClubMembershipApplicationSchema.index({ clubId: 1, applicantId: 1 });
ClubMembershipApplicationSchema.index({ status: 1 });
module.exports = mongoose.model('ClubMembershipApplication', ClubMembershipApplicationSchema);