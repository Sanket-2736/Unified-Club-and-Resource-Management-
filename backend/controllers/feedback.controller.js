const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const Club = require('../models/Club');

exports.submitEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rating, comments } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'completed') {
      return res.status(400).json({ message: 'Event not completed yet' });
    }

    if (!event.feedbackFormEnabled) {
      return res.status(403).json({ message: 'Feedback is disabled for this event' });
    }

    // Check registration & attendance
    const registration = await EventRegistration.findOne({
      eventId,
      userId,
      status: 'attended'
    });

    if (!registration) {
      return res.status(403).json({ message: 'Only attendees can submit feedback' });
    }

    if (registration.feedback?.submitted) {
      return res.status(400).json({ message: 'Feedback already submitted' });
    }

    // 1️⃣ Save feedback in EventRegistration
    registration.feedback = {
      submitted: true,
      rating,
      comments,
      submittedAt: new Date()
    };
    await registration.save();

    // 2️⃣ Save feedback in Event
    event.feedbacks.push({
      userId,
      rating,
      comments,
      submittedAt: new Date()
    });

    // 3️⃣ Recalculate feedback summary
    const totalResponses = event.feedbacks.length;
    const avgRating =
      event.feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalResponses;

    event.feedbackSummary = {
      averageRating: Number(avgRating.toFixed(2)),
      totalResponses,
      npsScore: null // optional / future
    };

    await event.save();

    res.json({
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};


exports.getEventFeedbacks = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('feedbacks.userId', 'firstName lastName email')
      .select('name feedbacks feedbackSummary');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      eventName: event.name,
      summary: event.feedbackSummary,
      feedbacks: event.feedbacks
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch feedbacks' });
  }
};

exports.getClubFeedbackAnalytics = async (req, res) => {
  try {
    const { clubId } = req.params;

    const events = await Event.find({
      'organizedBy.clubId': clubId,
      status: 'completed'
    }).select('name feedbackSummary');

    if (!events.length) {
      return res.json({
        message: 'No completed events with feedback',
        data: []
      });
    }

    let totalResponses = 0;
    let ratingSum = 0;

    events.forEach(e => {
      if (e.feedbackSummary?.totalResponses) {
        totalResponses += e.feedbackSummary.totalResponses;
        ratingSum +=
          e.feedbackSummary.averageRating *
          e.feedbackSummary.totalResponses;
      }
    });

    const clubAverageRating =
      totalResponses > 0 ? (ratingSum / totalResponses).toFixed(2) : null;

    res.json({
      clubId,
      totalEvents: events.length,
      totalFeedbackResponses: totalResponses,
      clubAverageRating,
      events: events.map(e => ({
        eventName: e.name,
        averageRating: e.feedbackSummary?.averageRating || null,
        responses: e.feedbackSummary?.totalResponses || 0
      }))
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch club feedback analytics' });
  }
};

exports.toggleEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { enabled } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.feedbackFormEnabled = enabled;
    await event.save();

    res.json({
      message: `Feedback ${enabled ? 'enabled' : 'disabled'} for event`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update feedback settings' });
  }
};

