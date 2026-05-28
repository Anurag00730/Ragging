const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const Complaint = require('../models/Complaint');
const BlockedIP = require('../models/BlockedIP');
const auth = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration (Free local file uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'evidence-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation (Images, PDFs, Docs only)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and Word documents are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});

// Anti-Spam Rate Limiter: Maximum 3 complaints per 15 minutes per IP
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, 
  message: { msg: 'Spam Prevention Active: You have submitted too many reports in a short time. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST api/complaints/submit
// @desc    Submit a complaint anonymously
// @access  Public (Rate Limited)
router.post('/submit', submitLimiter, upload.array('evidence', 5), async (req, res) => {
  try {
    const { category, title, description, incidentDate, incidentTime, incidentLocation, department } = req.body;

    if (!category || !title || !description || !incidentDate || !incidentTime || !incidentLocation) {
      return res.status(400).json({ msg: 'Please enter all required fields including Date, Time, and Location.' });
    }

    // Generate SHA-256 hash of client IP
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex');

    // Check if IP is currently blocked
    const blockedRecord = await BlockedIP.findOne({ ipHash });
    if (blockedRecord && blockedRecord.blockedUntil && blockedRecord.blockedUntil > new Date()) {
      const diffTime = blockedRecord.blockedUntil - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return res.status(403).json({
        msg: `Aapko spamming ki wajah se block kar diya gaya hai. Aap agle ${diffDays} dino tak new complaint submit nahi kar sakte.`
      });
    }

    // Generate unique Tracking ID: e.g. RAG-D4A19
    const trackingId = 'RAG-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    // Map evidence file paths (relative to server root for easy static serving)
    const evidenceUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        evidenceUrls.push(`/uploads/${file.filename}`);
      });
    }

    const newComplaint = new Complaint({
      trackingId,
      category,
      title,
      description,
      incidentDate,
      incidentTime,
      incidentLocation,
      department: department || 'General Administration',
      evidenceUrls,
      ipHash,
      publicUpdates: [{
        message: 'Complaint filed successfully. Awaiting HOD review.'
      }]
    });

    await newComplaint.save();

    res.status(201).json({
      msg: 'Complaint submitted anonymously!',
      trackingId,
      status: 'Pending'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error during submission' });
  }
});

// @route   GET api/complaints/track/:trackingId
// @desc    Track a complaint status by Tracking ID (Does not leak internal admin notes)
// @access  Public
router.post('/track', async (req, res) => {
  const { trackingId } = req.body;
  if (!trackingId) {
    return res.status(400).json({ msg: 'Tracking ID is required' });
  }

  try {
    const complaint = await Complaint.findOne({ trackingId }).select('-internalNotes');
    if (!complaint) {
      return res.status(404).json({ msg: 'No complaint found with this Tracking ID' });
    }
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ======================== ADMIN PROTECTED ROUTES ========================

// @route   GET api/complaints/
// @desc    Get all complaints (HODs see their department first, SuperAdmin sees all)
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Role-based filtering: If HOD, filter by department by default (with option to see all if requested)
    if (req.admin.role === 'HOD' && req.query.filterDept === 'true') {
      query.department = req.admin.department;
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT api/complaints/:id/status
// @desc    Update complaint status and send public message to student
// @access  Private (Admin)
router.put('/:id/status', auth, async (req, res) => {
  const { status, publicMessage } = req.body;

  if (!status) {
    return res.status(400).json({ msg: 'Status is required' });
  }

  try {
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    complaint.status = status;
    
    // Add public update update log
    if (publicMessage) {
      complaint.publicUpdates.push({ message: publicMessage });
    } else {
      complaint.publicUpdates.push({ message: `Status updated to: ${status}` });
    }

    // Handle Spam & Auto-Block trigger
    if (status === 'Spam' && complaint.ipHash) {
      let blockedRecord = await BlockedIP.findOne({ ipHash: complaint.ipHash });
      if (!blockedRecord) {
        blockedRecord = new BlockedIP({
          ipHash: complaint.ipHash,
          spamCount: 1
        });
      } else {
        blockedRecord.spamCount += 1;
        if (blockedRecord.spamCount >= 3) {
          blockedRecord.blockedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        }
      }
      await blockedRecord.save();
    }

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/complaints/:id/notes
// @desc    Add an internal note visible only to admins/HODs
// @access  Private (Admin)
router.post('/:id/notes', auth, async (req, res) => {
  const { note } = req.body;

  if (!note) {
    return res.status(400).json({ msg: 'Note content is required' });
  }

  try {
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found' });
    }

    complaint.internalNotes.push({
      note,
      adminName: req.admin.name
    });

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
