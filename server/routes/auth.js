const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../middleware/authMiddleware');

// @route   POST api/auth/register
// @desc    Register an admin (HOD/SuperAdmin)
// @access  Public (for initial setup, can be restricted later)
router.post('/register', async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: 'Admin with this email already exists' });
    }

    admin = new Admin({
      name,
      email,
      password,
      role,
      department
    });

    const salt = await bcrypt.genSalt(12);
    admin.password = await bcrypt.hash(password, salt);

    await admin.save();

    const payload = {
      admin: {
        id: admin.id,
        role: admin.role,
        department: admin.department,
        name: admin.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'complaint_dashboard_jwt_secret_token_12345',
      { expiresIn: '3h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, department: admin.department } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      admin: {
        id: admin.id,
        role: admin.role,
        department: admin.department,
        name: admin.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'complaint_dashboard_jwt_secret_token_12345',
      { expiresIn: '3h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, department: admin.department } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/me
// @desc    Get logged in admin details
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
