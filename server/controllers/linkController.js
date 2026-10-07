const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Link = require('../models/Link');

/**
 * @route   POST /api/links
 * @desc    Patient requests a link with a doctor using doctorCode
 * @access  Private (Patient)
 */
const requestLink = async (req, res, next) => {
  try {
    const { doctorCode } = req.body;
    if (!doctorCode) {
      return res.status(400).json({ message: 'Doctor code is required' });
    }

    const doctorUser = await User.findOne({
      doctorCode: doctorCode.toUpperCase().trim(),
      role: 'doctor'
    });

    if (!doctorUser) {
      return res.status(404).json({ message: 'No doctor found with this unique code' });
    }

    // Check existing link
    let existingLink = await Link.findOne({
      doctor: doctorUser._id,
      patient: req.user.id
    });

    if (existingLink) {
      if (existingLink.status === 'active') {
        return res.status(400).json({ message: 'You are already linked with this doctor' });
      }
      if (existingLink.status === 'pending') {
        return res.status(400).json({ message: 'Link request is already pending doctor approval' });
      }
      // If revoked, re-request
      existingLink.status = 'pending';
      await existingLink.save();
      return res.json({ message: 'Link request re-sent successfully', link: existingLink });
    }

    const link = await Link.create({
      doctor: doctorUser._id,
      patient: req.user.id,
      status: 'pending'
    });

    res.status(201).json({ message: 'Link request sent to doctor successfully', link });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/links
 * @desc    Get all links for logged in user (doctor or patient)
 * @access  Private
 */
const getLinks = async (req, res, next) => {
  try {
    const isDoctor = req.user.role === 'doctor';
    let links = [];

    if (isDoctor) {
      links = await Link.find({ doctor: req.user.id })
        .populate('patient', 'name email role')
        .sort({ updatedAt: -1 });

      // Attach patient profile info
      const populatedLinks = await Promise.all(
        links.map(async (link) => {
          const profile = await PatientProfile.findOne({ user: link.patient._id });
          return {
            ...link.toObject(),
            patientProfile: profile
          };
        })
      );
      return res.json({ links: populatedLinks });
    } else {
      links = await Link.find({ patient: req.user.id })
        .populate('doctor', 'name email role doctorCode')
        .sort({ updatedAt: -1 });

      const populatedLinks = await Promise.all(
        links.map(async (link) => {
          const profile = await DoctorProfile.findOne({ user: link.doctor._id });
          return {
            ...link.toObject(),
            doctorProfile: profile
          };
        })
      );
      return res.json({ links: populatedLinks });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/links/:id
 * @desc    Doctor accepts ('active') or rejects ('revoked') a link request
 * @access  Private (Doctor)
 */
const updateLinkStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'revoked', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    const link = await Link.findById(id);
    if (!link) {
      return res.status(404).json({ message: 'Link request not found' });
    }

    if (link.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the specified doctor can update this link status' });
    }

    link.status = status;
    await link.save();

    res.json({ message: `Link status updated to ${status}`, link });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/links/:id
 * @desc    Revoke link (either patient or doctor)
 * @access  Private
 */
const deleteLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id);

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    const isAuthorized =
      link.doctor.toString() === req.user.id ||
      link.patient.toString() === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to modify this link' });
    }

    link.status = 'revoked';
    await link.save();

    res.json({ message: 'Link revoked successfully', link });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestLink,
  getLinks,
  updateLinkStatus,
  deleteLink
};
