const EventSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
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
  
  eventType: [{
    type: String,
    enum: ['workshop', 'seminar', 'competition', 'cultural', 'sports', 'conference', 'social_service', 'fundraiser', 'meeting', 'hackathon', 'exhibition', 'guest_lecture', 'networking'],
    required: true
  }],
  
  tags: [{
    type: String
  }],
  
  organizedBy: {
    clubId: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: true
    },
    primaryCoordinatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  
  collaborators: [{
    clubId: {
      type: Schema.Types.ObjectId,
      ref: 'Club'
    },
    role: {
      type: String,
      enum: ['lead_organizer', 'co_organizer']
    },
    coordinatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
  }],
  
  // Date & Time
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    hours: Number,
    minutes: Number
  },
  isMultiDay: {
    type: Boolean,
    default: false
  },
  
  // Venue
  venueType: {
    type: String,
    enum: ['physical', 'virtual', 'hybrid'],
    required: true
  },
  physicalVenue: {
    venueName: String,
    building: String,
    roomNumber: String,
    address: String,
    capacity: Number
  },
  virtualVenue: {
    platform: String,
    meetingLink: String,
    meetingId: String,
    passcode: String
  },
  
  // Registration
  registrationSettings: {
    isRegistrationRequired: {
      type: Boolean,
      default: true
    },
    registrationStartDate: Date,
    registrationDeadline: Date,
    capacity: {
      type: Number,
      default: 0
    },
    registrationType: {
      type: String,
      enum: ['individual', 'team', 'both'],
      default: 'individual'
    },
    teamSettings: {
      minTeamSize: Number,
      maxTeamSize: Number
    },
    customQuestions: [{
      question: String,
      type: {
        type: String,
        enum: ['text', 'multiple_choice', 'checkbox', 'dropdown']
      },
      options: [String],
      required: Boolean
    }]
  },
  
  // Payment
  registrationFee: {
    isFree: {
      type: Boolean,
      default: true
    },
    amount: {
      type: Number,
      default: 0
    },
    qrCode: {
      type: String,
    },
  },
  
  // Media
  poster: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  banner: {
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
    uploadedAt: Date
  }],
  
  // Additional Information
  externalWebsite: String,
  prerequisites: String,
  eligibilityCriteria: [String],
  specialInstructions: [String],
  
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'private', 'members_only'],
    default: 'public'
  },
  
  feedbackFormEnabled: {
    type: Boolean,
    default: true
  },

  feedbacks: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comments: String,
    submittedAt: {type: Date, default: Date.now}
  }],
  
  // Event States
  status: {
    type: String,
    enum: ['draft', 'pending_internal_approval', 'pending_admin_approval', 'changes_requested', 'approved', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled', 'rejected'],
    default: 'draft'
  },
  
  // Resources Allocated
  resourcesAllocated: [{
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource'
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'ResourceBooking'
    },
    quantity: Number,
    allocatedAt: Date
  }],
  
  // Registrations
  totalRegistrations: {
    type: Number,
    default: 0
  },
  totalAttendance: {
    type: Number,
    default: 0
  },
  
  // Speakers/Guests
  speakers: [{
    name: String,
    designation: String,
    organization: String,
    bio: String,
    photo: String,
    contactEmail: String,
    contactPhone: String
  }],
  
  // Post-Event
  feedbackSummary: {
    averageRating: Number,
    totalResponses: Number,
    npsScore: Number
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date,
}, {
  timestamps: true
});

EventSchema.index({ name: 1 });
EventSchema.index({ 'organizedBy.clubId': 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1, endDate: 1 });
module.exports = mongoose.model('Event', EventSchema);