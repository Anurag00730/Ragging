const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'HOD', 'Warden'],
    default: 'HOD'
  },
  department: {
    type: String, // e.g. "Computer Science", "Mechanical", "General Administration"
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', AdminSchema);
