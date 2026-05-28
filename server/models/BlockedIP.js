const mongoose = require('mongoose');

const BlockedIPSchema = new mongoose.Schema({
  ipHash: {
    type: String,
    required: true,
    unique: true
  },
  spamCount: {
    type: Number,
    default: 1
  },
  blockedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BlockedIP', BlockedIPSchema);
