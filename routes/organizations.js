const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Organization = require('../models/Organization');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/organizations
// @desc    Get all organizations with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      type,
      location,
      radius,
      services,
      sortBy = 'name',
      order = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    let query = { status: 'active' };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by services
    if (services) {
      query.services = { $in: services.split(',') };
    }

    // Filter by location and radius
    if (location && radius) {
      const [lat, lng] = location.split(',').map(Number);
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: parseInt(radius) * 1609.34 // Convert miles to meters
        }
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const organizations = await Organization.find(query)
      .populate('admin', 'name email')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Organization.countDocuments(query);

    res.json({
      organizations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/organizations/:id
// @desc    Get organization by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('admin', 'name email phone')
      .populate('members.user', 'name email role');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(organization);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/organizations
// @desc    Create a new organization
// @access  Private
router.post('/', [
  auth,
  body('name', 'Name is required').not().isEmpty(),
  body('description', 'Description is required').not().isEmpty(),
  body('type', 'Type is required').isIn(['food-bank', 'shelter', 'community-center', 'church', 'non-profit', 'other']),
  body('contact.email', 'Contact email is required').isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      type,
      contact,
      address,
      operatingHours,
      services,
      capacity,
      requirements,
      logo,
      images
    } = req.body;

    const newOrganization = new Organization({
      name,
      description,
      type,
      contact,
      address,
      operatingHours,
      services: services || [],
      capacity,
      requirements,
      logo,
      images: images || [],
      admin: req.user.id,
      members: [{ user: req.user.id, role: 'coordinator' }]
    });

    const organization = await newOrganization.save();
    await organization.populate('admin', 'name email');

    res.json(organization);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/organizations/:id
// @desc    Update organization
// @access  Private (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is the admin
    if (organization.admin.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedOrganization = await Organization.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('admin', 'name email');

    res.json(updatedOrganization);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/organizations/:id
// @desc    Delete organization
// @access  Private (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is the admin
    if (organization.admin.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await organization.remove();
    res.json({ message: 'Organization removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/organizations/:id/join
// @desc    Join an organization
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.status !== 'active') {
      return res.status(400).json({ message: 'Organization is not active' });
    }

    // Check if user is already a member
    const isMember = organization.members.some(
      member => member.user.toString() === req.user.id
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this organization' });
    }

    // Add user as member
    organization.members.push({
      user: req.user.id,
      role: 'member'
    });

    await organization.save();
    await organization.populate('members.user', 'name email role');

    res.json(organization);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/organizations/:id/leave
// @desc    Leave an organization
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is the admin
    if (organization.admin.toString() === req.user.id) {
      return res.status(400).json({ message: 'Admin cannot leave organization' });
    }

    // Remove user from members
    organization.members = organization.members.filter(
      member => member.user.toString() !== req.user.id
    );

    await organization.save();
    await organization.populate('members.user', 'name email role');

    res.json(organization);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/organizations/:id/members/:userId/role
// @desc    Update member role
// @access  Private (admin only)
router.put('/:id/members/:userId/role', [
  auth,
  body('role', 'Role is required').isIn(['member', 'volunteer', 'coordinator'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user is the admin
    if (organization.admin.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update member role
    const memberIndex = organization.members.findIndex(
      member => member.user.toString() === req.params.userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found' });
    }

    organization.members[memberIndex].role = role;
    await organization.save();
    await organization.populate('members.user', 'name email role');

    res.json(organization);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/organizations/search
// @desc    Search organizations
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, type, services, page = 1, limit = 10 } = req.query;

    let query = { status: 'active' };

    // Search by name
    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by services
    if (services) {
      query.services = { $in: services.split(',') };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const organizations = await Organization.find(query)
      .populate('admin', 'name email')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Organization.countDocuments(query);

    res.json({
      organizations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
