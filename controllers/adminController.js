const User = require('../models/user.model');
const Slot = require('../models/slot.model');
const bcrypt = require('bcrypt');
const moment = require('moment'); // For date and time  manipulation




exports.adminLogin = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;
    const adminUser = await User.findOne({ phoneNumber, role: "admin" });
    console.log(adminUser)
    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid phone number or password.' });
    }

    const adminDetails = {
      _id: adminUser._id,
      name: adminUser.name,
      role: adminUser.role,
      phoneNumber: adminUser.phoneNumber,
    };
    res.json({
      message: 'Admin login successful.',
      adminDetails
    });
  } catch (error) {
    next(error);
  }
};



exports.getTotalUsers = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const users = await User.find();
    res.json({ totalUsers, users });
  } catch (error) {
    next(error);
  }
};

exports.filterUsers = async (req, res, next) => {
  try {
    const { filterBy, filterValue } = req.query;

    let filter = {};
    if (filterBy === 'age') {
      filter = { age: filterValue };
    } else if (filterBy === 'pincode') {
      filter = { pincode: filterValue };
    } else if (filterBy === 'vaccinationStatus') {
      if (filterValue === 'none') {
        filter = { $or: [{ firstDoseRegistered: false }, { secondDoseRegistered: false }] };
      } else if (filterValue === 'firstDoseCompleted') {
        filter = { firstDoseRegistered: true, secondDoseRegistered: false };
      } else if (filterValue === 'allCompleted') {
        filter = { firstDoseRegistered: true, secondDoseRegistered: true };
      }
    }

    const filteredUsers = await User.find(filter);
    res.json(filteredUsers);
  } catch (error) {
    next(error);
  }
};

exports.getRegisteredSlots = async (req, res, next) => {
  try {
    const { date } = req.query;

    const startDate = moment(date).startOf('day').toDate();
    const endDate = moment(date).endOf('day').toDate();

    const slots = await Slot.find({
      date: { $gte: startDate, $lte: endDate },
    });
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

exports.getVaccineSlotDetails = async (req, res, next) => {
  try {
    const startDate = moment('2024-05-01').startOf('day').toDate();
    const endDate = moment('2024-05-30').endOf('day').toDate();

    const totalSlots = await Slot.countDocuments({
      date: { $gte: startDate, $lte: endDate },
    });

    const totalAvailableDoses = totalSlots * 10; // Assuming 10 doses per slot

    res.json({ totalSlots, totalAvailableDoses });
  } catch (error) {
    next(error);
  }
};



exports.createSlot = async (req, res, next) => {
  try {
    const { date, startTime, endTime, dose } = req.body;
    const vaccinationDriveStart = moment('2024-05-01').startOf('day').toDate();
    const vaccinationDriveEnd = moment('2024-05-30').endOf('day').toDate();

    // Combine date and time to form complete date-time strings
    const startDateTime = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm').toDate();
    const endDateTime = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm').toDate();

    // Ensure slot creation is within the vaccination drive period
    if (
      moment(startDateTime).isBefore(moment('2024-05-01T10:00')) ||
      moment(endDateTime).isAfter(moment('2024-05-30T17:00')) ||
      moment(startDateTime).minutes() % 30 !== 0 ||  // Ensure start time aligns with 30-minute interval
      moment(endDateTime).minutes() % 30 !== 0 ||    // Ensure end time aligns with 30-minute interval
      moment(startDateTime).isAfter(endDateTime) ||      // Start time should be before end time
      moment(date, 'YYYY-MM-DD').isBefore(vaccinationDriveStart) ||
      moment(date, 'YYYY-MM-DD').isAfter(vaccinationDriveEnd)
    ) {
      return res.status(400).json({ message: 'Invalid slot creation parameters.' });
    }

    // Check for overlapping slots
    const existingSlots = await Slot.find({
      date,
      $or: [
        { $and: [{ startTime: { $lte: startDateTime } }, { endTime: { $gt: startDateTime } }] },
        { $and: [{ startTime: { $lt: endDateTime } }, { endTime: { $gte: endDateTime } }] },
      ],
    });

    if (existingSlots.length > 0) {
      return res.status(400).json({ message: 'Slot creation conflicts with existing slots.' });
    }

    // Create new Slot object based on schema
    const newSlot = new Slot({
      date,
      startTime: startDateTime,
      endTime: endDateTime,
      dose,
      availableDoses: 10,
      status: 'available',
    });

    await newSlot.save();
    res.json({ message: 'Slot created successfully.' });
  } catch (error) {
    next(error);
  }
};



