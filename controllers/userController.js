// controllers/userController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.register = async (req, res) => {
  try {
    const { name, phoneNumber, age, pincode, aadharNo, password } = req.body;

    // Check if user with given phone number already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this phone number.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, phoneNumber, age, pincode, aadharNo, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'An error occurred while registering user.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });

    // Include user details in the response
    const userDetails = {
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      aadharNo: user.aadharNo,
      pincode: user.pincode,
      firstDoseRegistered: user.firstDoseRegistered,
      secondDoseRegistered: user.secondDoseRegistered,
    };

    res.json({ token, user: userDetails });

    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'An error occurred while logging in.' });
  }
};
