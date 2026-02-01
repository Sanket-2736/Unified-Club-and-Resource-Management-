  const Resource = require('../models/Resource');
  const Event = require('../models/Event');
  const Club = require('../models/Club');

  exports.createResource = async (req, res) => {
    try {
      const resource = await Resource.create(req.body);
      res.status(201).json({ message: 'Resource created', resource });
    } catch (err) {
      res.status(500).json({ message: 'Failed to create resource' });
    }
  };


  exports.updateResource = async (req, res) => {
    try {
      const { resourceId } = req.params;

      const resource = await Resource.findByIdAndUpdate(
        resourceId,
        req.body,
        { new: true }
      );

      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      res.json({ message: 'Resource updated', resource });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update resource' });
    }
  };


  exports.toggleResourceAvailability = async (req, res) => {
    try {
      const { resourceId } = req.params;
      const { isAvailable } = req.body;

      const resource = await Resource.findByIdAndUpdate(
        resourceId,
        { isAvailable },
        { new: true }
      );

      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      res.json({ message: 'Availability updated', resource });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update availability' });
    }
  };

