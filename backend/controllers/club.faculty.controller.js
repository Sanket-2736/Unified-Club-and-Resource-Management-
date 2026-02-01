const Club = require("../models/Club");

/**
 * ======================================================
 * FACULTY – CLUB OVERSIGHT
 * ======================================================
 */

/**
 * 1. View full club details (including members)
 */
exports.getClubDetails = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId)
      .populate("members.userId", "firstName lastName email role isActive");

    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    res.status(200).json({
      success: true,
      club,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Activate / Deactivate a club member (soft action)
 */
exports.toggleClubMemberStatus = async (req, res) => {
  try {
    const { clubId, userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    const member = club.members.find(
      m => m.userId.toString() === userId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in club",
      });
    }

    member.isActive = isActive;

    await club.save();

    res.status(200).json({
      success: true,
      message: `Member ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Remove a member from the club (with reason)
 */
exports.removeClubMember = async (req, res) => {
  try {
    const { clubId, userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Removal reason is required",
      });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    const member = club.members.find(
      m => m.userId.toString() === userId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in club",
      });
    }

    member.isActive = false;
    member.leftAt = new Date();
    member.leftReason = reason;

    club.totalMembers = Math.max(0, club.totalMembers - 1);

    await club.save();

    res.status(200).json({
      success: true,
      message: "Member removed from club successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const ClubMembershipApplication = require("../models/ClubMembershipApplication");
const Club = require("../models/Club");

/**
 * ======================================================
 * FACULTY – MEMBERSHIP APPLICATION REVIEW
 * ======================================================
 */

/**
 * 1. View membership applications for a club
 */
exports.getMembershipApplications = async (req, res) => {
  try {
    const { clubId } = req.params;

    const applications = await ClubMembershipApplication.find({ clubId })
      .populate("applicantId", "firstName lastName email rollNumber")
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Approve / Reject membership application
 */
exports.reviewMembershipApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reviewComments } = req.body;
    const facultyId = req.user.id; // from auth middleware

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
    }

    const application = await ClubMembershipApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Application already reviewed",
      });
    }

    application.status = status;
    application.reviewComments = reviewComments || "";
    application.reviewedBy = facultyId;
    application.reviewedAt = new Date();

    await application.save();

    // If approved → add member to club
    if (status === "approved") {
      await Club.findByIdAndUpdate(application.clubId, {
        $push: {
          members: {
            userId: application.applicantId,
            role: "core_committee",
            isActive: true,
            joinedAt: new Date(),
          },
        },
        $inc: { totalMembers: 1 },
      });
    }

    res.status(200).json({
      success: true,
      message: `Membership application ${status}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'pending_internal_approval') {
      return res.status(400).json({
        message: 'Event is not pending faculty approval'
      });
    }

    // Faculty approves → goes to admin
    event.status = 'pending_admin_approval';

    await event.save();

    res.json({
      message: 'Event approved by faculty and sent to admin',
      event
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Faculty approval failed' });
  }
};

const Club = require('../models/Club');

exports.transitionClubCommittee = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { newPresidentId, newCommittee = [] } = req.body;

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    // 1️⃣ Archive current president
    club.members.forEach(member => {
      if (member.role === 'president' && member.isActive) {
        member.isActive = false;
        member.leftAt = new Date();
        member.leftReason = 'Committee transition';
      }
    });

    // 2️⃣ Assign new president
    club.members.push({
      userId: newPresidentId,
      role: 'president',
      isActive: true,
      joinedAt: new Date()
    });

    // 3️⃣ Assign new committee members
    newCommittee.forEach(userId => {
      club.members.push({
        userId,
        role: 'core_committee',
        isActive: true,
        joinedAt: new Date()
      });
    });

    club.totalMembers = club.members.filter(m => m.isActive).length;
    await club.save();

    res.json({ message: 'Committee transitioned successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

