const Club = require("../models/Club");
const User = require("../models/User");
const Event = require("../models/Event");

/**
 * ======================================================
 * CLUB MANAGEMENT (ADMIN)
 * ======================================================
 */

/**
 * 1. Approve / Reject / Request Changes for Club
 */
exports.updateClubApprovalStatus = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { approvalStatus } = req.body;

    const allowedStatuses = [
      "approved",
      "rejected",
      "changes_requested",
      "pending",
    ];

    if (!allowedStatuses.includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval status",
      });
    }

    const club = await Club.findByIdAndUpdate(
      clubId,
      { approvalStatus },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Club approval status updated to ${approvalStatus}`,
      club,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 2. Activate / Deactivate Club
 */
exports.toggleClubStatus = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid club status",
      });
    }

    const club = await Club.findByIdAndUpdate(
      clubId,
      { status },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Club marked as ${status}`,
      club,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 3. Monitor Club Activities
 * - Members
 * - Events
 * - Recent Events
 */
exports.getClubActivityReport = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId).populate(
      "members.userId",
      "firstName lastName email role isActive"
    );

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    const events = await Event.find({
      "organizedBy.clubId": clubId,
    })
      .select("name status startDate endDate")
      .sort({ startDate: -1 });

    // Sync statistics (optional but recommended)
    club.totalMembers = club.members.length;
    club.totalEvents = events.length;
    await club.save();

    res.status(200).json({
      success: true,
      activity: {
        clubName: club.name,
        approvalStatus: club.approvalStatus,
        status: club.status,
        totalMembers: club.members.length,
        activeMembers: club.members.filter(m => m.isActive).length,
        totalEvents: events.length,
        events,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * 4. Assign Faculty Coordinator to Club
 */
exports.assignFacultyCoordinator = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Faculty email is required",
      });
    }

    const faculty = await User.findOne({
      email: email.toLowerCase(),
      role: "faculty_coordinator",
      isActive: true,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Active faculty coordinator not found",
      });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    if (club.approvalStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Club must be approved before assigning faculty",
      });
    }

    if (club.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Club must be active to assign faculty",
      });
    }

    const alreadyAssigned = club.members.some(
      m => m.userId.toString() === faculty._id.toString()
    );

    if (!alreadyAssigned) {
      club.members.push({
        userId: faculty._id,
        role: "faculty_coordinator",
        isActive: true,
        joinedAt: new Date(),
      });

      club.totalMembers += 1;
    }

    await club.save();

    res.status(200).json({
      success: true,
      message: "Faculty coordinator assigned successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
