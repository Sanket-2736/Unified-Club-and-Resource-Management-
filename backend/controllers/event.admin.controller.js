const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");

/**
 * ======================================================
 * EVENT MANAGEMENT (ADMIN)
 * ======================================================
 */

/**
 * 1. Approve / Reject Event (Admin Level)
 */
exports.updateEventApprovalStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["approved", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event approval status",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.status !== "pending_admin_approval") {
      return res.status(400).json({
        success: false,
        message: "Event is not pending admin approval",
      });
    }

    event.status = status;

    if (status === "approved") {
      event.publishedAt = new Date();
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: `Event ${status} successfully`,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 2. Request Changes to Event
 */
exports.requestEventChanges = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (
      !["pending_admin_approval", "approved"].includes(event.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot request changes in current event state",
      });
    }

    event.status = "changes_requested";
    await event.save();

    res.status(200).json({
      success: true,
      message: "Changes requested from event organizers",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 3. Cancel Event
 */
exports.cancelEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: "cancelled" },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event cancelled successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 4. Monitor Event Registrations & Attendance
 */
exports.getEventStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const registrations = await EventRegistration.find({ eventId });

    const stats = {
      totalRegistrations: registrations.length,
      attended: registrations.filter(r => r.status === "attended").length,
      noShow: registrations.filter(r => r.status === "no_show").length,
      cancelled: registrations.filter(r => r.status === "cancelled").length,
      waitlisted: registrations.filter(r => r.status === "waitlisted").length,
    };

    // Sync stats with Event document
    event.totalRegistrations = stats.totalRegistrations;
    event.totalAttendance = stats.attended;
    await event.save();

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
