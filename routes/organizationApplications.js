const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const OrganizationApplication = require('../models/OrganizationApplication');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @route   POST api/organization-applications
// @desc    Submit a new organization application
// @access  Private
router.post('/', [
  auth,
  check('name', 'Name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('type', 'Type is required').isIn(['food-bank', 'shelter', 'community-center', 'church', 'non-profit', 'other']),
  check('contact.email', 'Contact email is required').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user already has a pending application
    const existingApplication = await OrganizationApplication.findOne({
      applicant: req.user.id,
      status: 'pending'
    });

    if (existingApplication) {
      return res.status(400).json({ msg: 'You already have a pending organization application' });
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

    const newApplication = new OrganizationApplication({
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
      applicant: req.user.id
    });

    const application = await newApplication.save();

    // Notify admins about new application
    const admins = await User.find({ role: 'admin' });
    
    for (const admin of admins) {
      const notification = new Notification({
        user: admin._id,
        type: 'admin',
        title: 'New Organization Application',
        message: `${req.user.name} has submitted an application for organization: ${name}`,
        relatedTo: {
          item: application._id,
          model: 'organizationApplication'
        }
      });
      
      await notification.save();
    }

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/organization-applications
// @desc    Get all organization applications (admin only)
// @access  Private (Admin only)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const applications = await OrganizationApplication.find(query)
      .populate('applicant', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
      
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/organization-applications/me
// @desc    Get current user's organization applications
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const applications = await OrganizationApplication.find({ applicant: req.user.id })
      .sort({ createdAt: -1 });
      
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/organization-applications/:id
// @desc    Get organization application by ID
// @access  Private (Owner or Admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await OrganizationApplication.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('reviewedBy', 'name');

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check if user is the applicant or an admin
    if (application.applicant._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(application);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Application not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/organization-applications/:id/review
// @desc    Review an organization application (approve or reject)
// @access  Private (Admin only)
router.put('/:id/review', [
  auth,
  adminAuth,
  check('status', 'Status is required').isIn(['approved', 'rejected']),
  check('reviewNotes', 'Review notes are required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status, reviewNotes } = req.body;

  try {
    const application = await OrganizationApplication.findById(req.params.id)
      .populate('applicant');

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ msg: 'This application has already been reviewed' });
    }

    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = req.user.id;
    application.reviewedAt = Date.now();

    await application.save();

    // If approved, create the organization
    if (status === 'approved') {
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
        images,
        applicant
      } = application;

      const newOrganization = new Organization({
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
        images,
        admin: applicant._id,
        members: [{ user: applicant._id, role: 'coordinator' }],
        isVerified: true
      });

      const organization = await newOrganization.save();

      // Update user to link them to the organization
      await User.findByIdAndUpdate(applicant._id, {
        organization: organization._id
      });
    }

    // Notify the applicant
    const notificationTitle = status === 'approved' ? 'Organization Application Approved' : 'Organization Application Rejected';
    const notificationMessage = status === 'approved' 
      ? `Your application for organization "${application.name}" has been approved. You can now manage your organization.`
      : `Your application for organization "${application.name}" has been rejected. Reason: ${reviewNotes}`;

    const notification = new Notification({
      user: application.applicant._id,
      type: 'system',
      title: notificationTitle,
      message: notificationMessage,
      relatedTo: {
        item: application._id,
        model: 'organizationApplication'
      }
    });

    await notification.save();

    res.json(application);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Application not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;