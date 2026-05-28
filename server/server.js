const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anti-ragging';

// Middleware
app.use(cors({
  origin: '*', // Allow connections from frontend
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Anti-Ragging Campus Portal API is running...');
});

// Start listening immediately
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Database connection & Auto-Seeding
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected successfully.');

    // Auto-seed a default HOD Admin if database is empty
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('hodadmin123', salt);

      const defaultAdmin = new Admin({
        name: 'Prof. Sharma (HOD CSE)',
        email: 'hod@college.edu',
        password: hashedPassword,
        role: 'HOD',
        department: 'Computer Science'
      });

      await defaultAdmin.save();
      console.log('==================================================');
      console.log('DEFAULT HOD ACCOUNT SEEDED FOR TESTING:');
      console.log('Email: hod@college.edu');
      console.log('Password: hodadmin123');
      console.log('==================================================');
    }
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
  });
