const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Ragging', 'Harassment', 'Physical Abuse', 'Verbal Abuse', 'Cyber Bullying', 'Academic issue', 'Other']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  incidentDate: {
    type: String, // String format (e.g. YYYY-MM-DD) for ease of manual entry
    required: true
  },
  incidentTime: {
    type: String, // String format (e.g. HH:MM)
    required: true
  },
  incidentLocation: {
    type: String, // e.g. "Library building, 2nd Floor" or "Canteen back block"
    required: true,
    trim: true
  },
  evidenceUrls: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Pending', 'Investigating', 'Resolved', 'Spam'],
    default: 'Pending'
  },
  ipHash: {
    type: String,
    required: false
  },
  publicUpdates: [
    {
      message: { type: String, required: true },
      updatedAt: { type: Date, default: Date.now }
    }
  ],
  internalNotes: [
    {
      note: { type: String, required: true },
      adminName: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
