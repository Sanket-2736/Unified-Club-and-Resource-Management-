const mongoose = require('mongoose');

const EventRegistrationSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Registration Type
  registrationType: {
    type: String,
    enum: ['individual', 'team'],
    default: 'individual'
  },
  
  // Team Details (if team registration)
  teamDetails: {
    teamName: String,
    teamMembers: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      email: String,
      role: String
    }],
    teamLeaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Registration Form Responses
  formResponses: [{
    question: String,
    answer: String
  }],
  
  // Additional Details
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  
  // Payment Details
  payment: {
    required: {
      type: Boolean,
      default: false
    },
    amount: Number,
    currency: String,
    status: {
      type: String,
      enum: ['pending', 'pending_verification', 'verified', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['online', 'offline', 'upi', 'cash', 'demand_draft']
    },
    
    // Online Payment
    transactionId: String,
    paymentGateway: String,
    paymentDate: Date,
    
    paymentProof: {
      url: String,
      publicId: String,
      uploadedAt: Date
    },
    
    // Verification
    verification: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'reupload_requested']
      },
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date,
    }
  },
  
  // Registration Status
  status: {
    type: String,
    enum: ['registered', 'waitlisted', 'cancelled', 'no_show', 'attended'],
    default: 'registered'
  },
  
  // Feedback
  feedback: {
    submitted: {
      type: Boolean,
      default: false
    },
    rating: Number,
    comments: String,
    submittedAt: Date
  },
  
  // Timestamps
  registeredAt: {
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

EventRegistrationSchema.index({ eventId: 1, userId: 1 });
EventRegistrationSchema.index({ status: 1 });
EventRegistrationSchema.index({ 'payment.status': 1 });
EventRegistrationSchema.index({ 'payment.verification.status': 1 });
module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);