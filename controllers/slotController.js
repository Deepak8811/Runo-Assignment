const Slot = require('../models/slot.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const { isSlotAvailable, isSlotUpdatable, generateTimeSlots } = require('../helpers/helpers');


exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const dateFilter = new Date(date)
    dateFilter.setUTCHours(0, 0, 0, 0);
    console.log("dateFilter", dateFilter);
    const availableSlots = await Slot.findOne({ date: dateFilter });
    res.status(200).json(availableSlots);
  } catch (error) {
    next(error);
  }
};


exports.registerSlot = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { slotId, dose, date } = req.body;
    const dateFilter = new Date(date)
    dateFilter.setUTCHours(0, 0, 0, 0);
    // console.log(dateFilter);

    const user = await User.findOne({ _id: userId });

    if (dose == "second" && !user.firstDoseRegistered) {
      return res.status(400).json({
        success: false,
        message: "First Dose has not been registered"
      })
    }
    const availableSlots = await Slot.findOne({ date: dateFilter });
    let isAlreadyBooked = false;
    let doseAvailable = true;
    // console.log("availableSlots", availableSlots)
    if (availableSlots) {
      const timeSlots = availableSlots.timeSlots;
      const updatedSlots = timeSlots.map(slot => {
        if (slot._id.toString() === slotId) {
          // console.log("matched slot", slot);
          isAlreadyBooked = slot.bookedBy.findIndex(user => user.userId.toString() == userId) != -1;

          if (!isAlreadyBooked) {
            if (slot.availableDoses < 1) doseAvailable = false;
            else {
              slot.availableDoses = slot.availableDoses - 1;
              slot.bookedBy.push({ userId, dose });
            }
          }

        }
        return slot;
      })
      availableSlots.timeSlots = updatedSlots;
      await availableSlots.save();
    }
    // Check if the requested dose is available
    if (!doseAvailable) {
      return res.status(400).json({
        success: false,
        message: "Requested dose is not available for this slot"
      });
    }

    if (isAlreadyBooked) {
      return res.status(400).json({
        success: false,
        message: "This slot is already booked"
      })
    }
    else {
      const bookedSlot = availableSlots.timeSlots.find(slot => slot._id.toString() === slotId);
      if (bookedSlot) {
        if (dose === 'first') {
          user.firstDoseRegistered = true;
          user.firstDoseDateTime = new Date(`${date} ${bookedSlot.startTime}`);
        } else if (dose === 'second') {
          user.secondDoseRegistered = true;
          user.secondDoseDateTime = new Date(`${date} ${bookedSlot.startTime}`);
        }
        await user.save();
      } else {
        return res.status(404).json({ success: false, message: 'Slot not found' });
      }
      return res.status(201).json({
        success: true,
        message: "Slot booked successfully"
      })
    }

  } catch (error) {
    next(error);
  }
};





exports.updateSlot = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { slotId, newSlotId, newDose } = req.body;

    const user = await User.findById(userId);

    // Find current slot by slotId
    const currentSlot = await Slot.findOne({ 'timeSlots._id': slotId, "timeSlots.bookedBy.userId": userId });
    if (!currentSlot) {
      return res.status(404).json({ success: false, message: 'Current slot not found.' });
    }

    const currentSlotBooking = currentSlot.timeSlots.map(slot => {
      if (slot._id.toString() === slotId) {
        const bookedBy = slot.bookedBy.filter(user => user.userId.toString() !== userId)
        slot.bookedBy = bookedBy;
        slot.availableDoses += 1;
      }
      return slot;
    });
    currentSlot.timeSlots = currentSlotBooking;
    await currentSlot.save();


    // Find new slot by newSlotId
    const newSlot = await Slot.findOne({ 'timeSlots._id': newSlotId });
    // console.log(newSlot);
    if (!newSlot) {
      return res.status(404).json({ success: false, message: 'New slot not found.' });
    }

    // Check if current slot is updatable (24 hours prior to start time)
    const dateOfSlotBooking = newDose === "first" ? user.firstDoseDateTime : user.secondDoseDateTime;
    const isCurrentSlotUpdatable = await isSlotUpdatable(dateOfSlotBooking, new Date());
    // console.log(isCurrentSlotUpdatable)
    if (!isCurrentSlotUpdatable) {
      return res.status(400).json({ success: false, message: 'Current slot cannot be updated within 24 hours of the start time.' });
    }


    if (newDose === 'first') {
      user.firstDoseDateTime = newSlot.date;
    } else if (newDose === 'second') {
      user.secondDoseDateTime = newSlot.date;
    }


    newSlot.timeSlots.id(newSlotId).availableDoses -= 1;

    // Add the booking details to the new slot
    const newSlotBooking = newSlot.timeSlots.map(slot => {
      if (slot._id.toString() === newSlotId) {
        slot.bookedBy.push({
          userId: userId,
          dose: newDose
        })
      }
      return slot;
    });
    newSlot.timeSlots = newSlotBooking;

    // Save changes to the user and slots
    await Promise.all([user.save(), newSlot.save()]);

    return res.status(200).json({ success: true, message: 'Slot updated successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
