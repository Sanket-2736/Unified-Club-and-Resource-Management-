const mongoose = require('mongoose');

const NotificationSchema = new Schema({
  
  // Notification Type
  type: {
    type: String,
    enum: [
      // Event Notifications
      'event_created', 'event_updated', 'event_approval', 'event_rejection',
      'event_registration_confirmation', 'payment_verification',
      'event_reminder', 'event_cancellation', 'certificate_available',
      'feedback_request',
    ],
    required: true
  },
  
  // Content
  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },
  
  // Action/Link
  actionUrl: String,
  actionText: String,
  
  // Related Entities
  relatedEntityType: {
    type: String,
    enum: ['event', 'club', 'booking', 'message', 'announcement', 'user']
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
}, {
  timestamps: true
});

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ category: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Notification', NotificationSchema);