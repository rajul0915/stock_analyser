const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/users
// @desc    Create a new user
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   GET /api/users
// @desc    Get all users
router.get('/', async (req, res) => {
  try {
    let users = await User.find();
    users = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email
    }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
