const Resource = require('../models/Resource');
const Event = require('../models/Event');
const Club = require('../models/Club');
const PDFDocument = require('pdfkit');

exports.getAvailableResources = async (req, res) => {
  try {
    const resources = await Resource.find({ isAvailable: true });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};


exports.requestResourceForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { resourceId, quantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.resourcesAllocated.push({
      resourceId,
      quantity,
      allocatedAt: null // pending
    });

    event.status = 'pending_internal_approval';
    await event.save();

    res.json({ message: 'Resource request submitted to faculty' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to request resource' });
  }
};


exports.facultyApproveResourceRequest = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.status !== 'pending_internal_approval') {
      return res.status(400).json({ message: 'Invalid event state' });
    }

    event.status = 'pending_admin_approval';
    await event.save();

    res.json({ message: 'Resource request forwarded to admin' });
  } catch (err) {
    res.status(500).json({ message: 'Faculty approval failed' });
  }
};


exports.adminApproveResourceAllocation = async (req, res) => {
  try {
    const { eventId, resourceId } = req.params;

    const event = await Event.findById(eventId);
    const resource = await Resource.findById(resourceId);

    if (!event || !resource) {
      return res.status(404).json({ message: 'Invalid data' });
    }

    // Capacity check
    if (resource.capacity < event.totalRegistrations) {
      return res.status(400).json({ message: 'Capacity insufficient' });
    }

    // Allocate
    event.resourcesAllocated = event.resourcesAllocated.map(r =>
      r.resourceId.toString() === resourceId
        ? { ...r.toObject(), allocatedAt: new Date() }
        : r
    );

    event.status = 'approved';
    await event.save();

    res.json({ message: 'Resource allocated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Allocation failed' });
  }
};

exports.removeResourceAllocation = async (req, res) => {
  try {
    const { eventId, resourceId } = req.params;
    const { reason } = req.body; // optional

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const allocationExists = event.resourcesAllocated.some(
      r => r.resourceId.toString() === resourceId
    );

    if (!allocationExists) {
      return res.status(400).json({
        message: 'Resource not allocated to this event'
      });
    }

    // 1️⃣ Remove allocation
    event.resourcesAllocated = event.resourcesAllocated.filter(
      r => r.resourceId.toString() !== resourceId
    );

    // 2️⃣ Optional: update event status
    if (event.status === 'approved') {
      event.status = 'changes_requested';
    }

    // 3️⃣ Optional: store reason
    if (reason) {
      event.specialInstructions.push(
        `Resource allocation removed: ${reason}`
      );
    }

    await event.save();

    res.json({
      message: 'Resource allocation removed successfully'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to remove resource allocation' });
  }
};


exports.generateHallRequestLetter = async (req, res) => {
  try {
    const { eventId, resourceId } = req.params;

    const event = await Event.findById(eventId);
    const club = await Club.findById(event.organizedBy.clubId);
    const resource = await Resource.findById(resourceId);

    const faculty = club.members.find(m => m.role === 'faculty_coordinator');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=hall-request.pdf');
    doc.pipe(res);

    doc.text(`To,
The Head of Department

Subject: Request for allotment of hall

Respected Sir/Madam,

We request permission to allot ${resource.name} for the event "${event.name}"
scheduled on ${event.startDate.toDateString()}.

Expected Participants: ${event.totalRegistrations || 'N/A'}

Thanking you.`);

    doc.moveDown(3);
    doc.text('President Signature: ____________________');
    doc.text('Name: ____________________');

    doc.moveDown(2);
    doc.text('Faculty Coordinator Signature: ____________________');
    doc.text('Name: ____________________');

    doc.end();

  } catch (err) {
    res.status(500).json({ message: 'Failed to generate letter' });
  }
};
