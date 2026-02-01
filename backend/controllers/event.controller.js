const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'registration_open') {
      return res.status(400).json({ message: 'Registration is closed' });
    }

    const alreadyRegistered = await EventRegistration.findOne({
      eventId,
      userId
    });

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered' });
    }

    const capacity = event.registrationSettings.capacity;
    const registeredCount = await EventRegistration.countDocuments({
      eventId,
      status: 'registered'
    });

    let status = 'registered';

    if (capacity > 0 && registeredCount >= capacity) {
      status = 'waitlisted';
    }

    const registration = await EventRegistration.create({
      eventId,
      userId,
      status
    });

    if (status === 'registered') {
      event.totalRegistrations += 1;
      await event.save();
    }

    res.status(201).json({
      message:
        status === 'registered'
          ? 'Registered successfully'
          : 'Event full. Added to waitlist',
      status
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.promoteWaitlistedUsers = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) return;

  const capacity = event.registrationSettings.capacity;
  if (!capacity) return;

  const registeredCount = await EventRegistration.countDocuments({
    eventId,
    status: 'registered'
  });

  const slotsAvailable = capacity - registeredCount;
  if (slotsAvailable <= 0) return;

  const waitlisted = await EventRegistration.find({
    eventId,
    status: 'waitlisted'
  })
    .sort({ registeredAt: 1 })
    .limit(slotsAvailable);

  for (const reg of waitlisted) {
    reg.status = 'registered';
    await reg.save();
    event.totalRegistrations += 1;
  }

  await event.save();
};



exports.completeEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'ongoing') {
      return res.status(400).json({
        message: 'Only ongoing events can be marked as completed'
      });
    }

    // 1️⃣ Mark event completed
    event.status = 'completed';
    await event.save();

    // 2️⃣ Update club statistics
    const club = await Club.findById(event.organizedBy.clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    club.totalEvents += 1;
    await club.save();

    // 3️⃣ Update organizing members
    const organizerIds = new Set();

    // Primary coordinator
    organizerIds.add(event.organizedBy.primaryCoordinatorId.toString());

    // Co-organizers
    event.collaborators.forEach(c => {
      if (c.coordinatorId) {
        organizerIds.add(c.coordinatorId.toString());
      }
    });

    // Push event into each user's eventsOrganized
    await User.updateMany(
      { _id: { $in: Array.from(organizerIds) } },
      { $addToSet: { eventsOrganized: event._id } }
    );

    res.json({
      message: 'Event completed and statistics updated successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to complete event' });
  }
};
