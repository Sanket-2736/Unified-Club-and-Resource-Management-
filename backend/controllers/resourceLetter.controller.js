const Event = require('../models/Event');
const Club = require('../models/Club');
const Resource = require('../models/Resource');
const PDFDocument = require('pdfkit');

exports.generateHallRequestLetter = async (req, res) => {
  try {
    const { eventId, resourceId } = req.params;

    const event = await Event.findById(eventId);
    const club = await Club.findById(event.organizedBy.clubId);
    const resource = await Resource.findById(resourceId);

    if (!event || !club || !resource) {
      return res.status(404).json({ message: 'Invalid data' });
    }

    // Check president
    const isPresident = club.members.some(
      m => m.userId.toString() === req.user.id && m.role === 'president'
    );

    if (!isPresident) {
      return res.status(403).json({ message: 'Only president can generate letter' });
    }

    // Get faculty coordinator
    const faculty = club.members.find(
      m => m.role === 'faculty_coordinator'
    );

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename=hall-request-letter.pdf'
    );

    doc.pipe(res);

    doc.fontSize(12).text(
      `To,
The Head of Department / Event Cell,

Subject: Request for allotment of hall for conducting an event

Respected Sir/Madam,

We, the members of "${club.name}", kindly request permission to allot
"${resource.name}" for conducting the following event.

Event Details:
• Event Name: ${event.name}
• Date: ${event.startDate.toDateString()}
• Time: ${event.startDate.toLocaleTimeString()} – ${event.endDate.toLocaleTimeString()}
• Venue: ${resource.name}
• Expected Participants: ${event.totalRegistrations || 'N/A'}

We assure that all college rules and regulations will be strictly followed.

Thanking you.

`,
      { align: 'left' }
    );

    doc.moveDown(3);

    doc.text('President Signature: ____________________');
    doc.text('Name: ____________________');

    doc.moveDown(2);

    doc.text('Faculty Coordinator Signature: ____________________');
    doc.text('Name: ____________________');

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate letter' });
  }
};

