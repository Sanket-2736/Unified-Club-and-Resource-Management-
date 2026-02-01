// controllers/club.controller.js
const Event = require('../models/Event');
const Club = require('../models/Club');
const cloudinary = require('../utils/cloudinary');

exports.uploadClubMedia = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { type } = req.body; // logo | cover | gallery

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `clubs/${clubId}`,
      resource_type: 'image'
    });

    const fileData = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      uploadedAt: new Date()
    };

    // ---------- Save based on type ----------
    if (type === 'logo') {
      club.logo = fileData;
    } 
    else if (type === 'cover') {
      club.coverImage = fileData;
    } 
    else if (type === 'gallery') {
      club.gallery.push({
        type: 'image',
        ...fileData,
        uploadedBy: req.user.id
      });
    } 
    else {
      return res.status(400).json({ message: 'Invalid media type' });
    }

    await club.save();

    res.json({
      message: 'Media uploaded successfully',
      data: fileData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Media upload failed' });
  }
};

exports.updateClubProfile = async (req, res) => {
  const { clubId } = req.body;

  const club = await Club.findById(clubId);
  if (!club) return res.status(404).json({ message: 'Club not found' });


  const allowedFields = [
    'tagline', 'description', 'missionStatement',
    'category', 'tags', 'contactEmail',
    'contactPhone', 'socialLinks'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      club[field] = req.body[field];
    }
  });

  await club.save();
  res.json({ message: 'Club profile updated', club });
};

exports.rescheduleEvent = async (req, res) => {
  const { eventId } = req.params;
  const { startDate, endDate } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  event.startDate = startDate;
  event.endDate = endDate;
  event.status = 'changes_requested';

  await event.save();
  res.json({ message: 'Event rescheduled, approval required again' });
};


exports.cancelEvent = async (req, res) => {
  const { eventId } = req.params;
  const { reason } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  event.status = 'cancelled';
  event.specialInstructions.push(`Cancelled: ${reason}`);

  await event.save();
  res.json({ message: 'Event cancelled' });
};


exports.publishEvent = async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (event.status !== 'approved') {
    return res.status(400).json({ message: 'Event not approved yet' });
  }

  event.status = 'published';
  event.publishedAt = new Date();

  await event.save();
  res.json({ message: 'Event published successfully' });
};


exports.submitEventForApproval = async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (event.status !== 'draft') {
    return res.status(400).json({ message: 'Invalid state transition' });
  }

  event.status = 'pending_internal_approval';
  await event.save();

  res.json({ message: 'Event submitted for faculty approval' });
};


exports.getClubAnalytics = async (req, res) => {
  const { clubId } = req.params;

  const club = await Club.findById(clubId);
  if (!club) return res.status(404).json({ message: 'Club not found' });

  const events = await Event.find({ 'organizedBy.clubId': clubId });

  res.json({
    totalMembers: club.members.filter(m => m.isActive).length,
    totalEvents: events.length,
    eventsByStatus: events.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {})
  });
};


exports.createEvent = async (req, res) => {
  const { clubId } = req.params;

  const event = await Event.create({
    ...req.body,
    organizedBy: {
      clubId,
      primaryCoordinatorId: req.user.id
    },
    status: 'draft'
  });

  res.status(201).json({ message: 'Event created in draft', event });
};


exports.updateEvent = async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (!['draft', 'changes_requested'].includes(event.status)) {
    return res.status(400).json({ message: 'Event cannot be edited now' });
  }

  Object.assign(event, req.body);
  await event.save();

  res.json({ message: 'Event updated', event });
};


exports.assignEventCoordinator = async (req, res) => {
  const { eventId } = req.params;
  const { coordinatorId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  event.collaborators.push({
    role: 'co_organizer',
    coordinatorId
  });

  await event.save();
  res.json({ message: 'Coordinator assigned' });
};

exports.publishEvent = async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (event.status !== 'approved') {
    return res.status(400).json({ message: 'Event not approved yet' });
  }

  event.status = 'published';
  event.publishedAt = new Date();

  await event.save();
  res.json({ message: 'Event published successfully' });
};


