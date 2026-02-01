const mongoose = require('mongoose');

const ResourceSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  hallNo: {
    type: String,
    unique: true,
    required: true
  },
  
  // Location
  location: {
    building: String,
    floor: String,
    roomNumber: String,
    storageLocation: String
  },
  
  // Capacity & Specifications
  capacity: Number,
  
  // Booking Rules
  bookingRules: {
    maxDuration: {
      hours: Number,
      days: Number
    },
    advanceBookingRequired: {
      days: Number
    },
    requiresApproval: {
      type: Boolean,
      default: true
    }
  },
  department: String,
  
  // Status
  isAvailable: {
    type: Boolean,
    default: true
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

ResourceSchema.index({ resourceId: 1 });
ResourceSchema.index({ category: 1, subcategory: 1 });
ResourceSchema.index({ availabilityStatus: 1 });
ResourceSchema.index({ condition: 1 });
module.exports = mongoose.model('Resource', ResourceSchema);