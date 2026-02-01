const Event = require('../models/Event');
const Club = require('../models/Club');
const cloudinary = require('../utils/cloudinary');

exports.bulkUploadEventGallery = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { captions = [] } = req.body;

    const event = await Event.findById(eventId);
    if (!event || event.status !== 'completed') {
      return res.status(400).json({ message: 'Event not completed' });
    }

    const uploads = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      const upload = await cloudinary.uploader.upload(file.path, {
        folder: `events/${eventId}/gallery`,
        resource_type: 'auto'
      });

      uploads.push({
        type: upload.resource_type === 'video' ? 'video' : 'image',
        url: upload.secure_url,
        publicId: upload.public_id,
        caption: captions[i] || '',
        uploadedAt: new Date()
      });
    }

    event.gallery.push(...uploads);
    await event.save();

    res.json({ message: 'Gallery uploaded', count: uploads.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.uploadEventGallery = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { caption } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 1️⃣ Fetch event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 2️⃣ Ensure event is completed
    if (event.status !== 'completed') {
      return res.status(400).json({
        message: 'Gallery can only be uploaded after event completion'
      });
    }

    // 3️⃣ Check president authorization
    const club = await Club.findById(event.organizedBy.clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const isPresident = club.members.some(
      m =>
        m.userId.toString() === userId &&
        m.role === 'president' &&
        m.isActive
    );

    if (!isPresident) {
      return res.status(403).json({
        message: 'Only club president can upload event gallery'
      });
    }

    // 4️⃣ Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `events/${eventId}/gallery`,
      resource_type: 'auto' // supports image & video
    });

    // 5️⃣ Push to event gallery
    event.gallery.push({
      type: uploadResult.resource_type === 'video' ? 'video' : 'image',
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      caption,
      uploadedAt: new Date()
    });

    await event.save();

    res.json({
      message: 'Event gallery uploaded successfully',
      media: {
        url: uploadResult.secure_url,
        caption
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload event gallery' });
  }
};
