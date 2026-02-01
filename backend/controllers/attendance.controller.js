exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { attendedUserIds } = req.body;

    await EventRegistration.updateMany(
      { eventId, userId: { $in: attendedUserIds } },
      { status: 'attended' }
    );

    await EventRegistration.updateMany(
      { eventId, userId: { $nin: attendedUserIds } },
      { status: 'no_show' }
    );

    const event = await Event.findById(eventId);
    event.totalAttendance = attendedUserIds.length;
    await event.save();

    res.json({ message: 'Attendance updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
