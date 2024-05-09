const Slot = require('../models/slot.model')


const isSlotAvailable = async (slotId) => {
  // const slot = await Slot.findById(slotId);
  const slot = await Slot.findOne({ 'timeSlots._id': slotId });
  // return slot && slot.status === "available";
  return slot;
};

const isSlotUpdatable = async (date, currentTime) => {
  const timeDifference = date.getTime() - currentTime.getTime();
  // console.log(timeDifference)
  return timeDifference > 24 * 60 * 60 * 1000; // More than 24 hours before slot time
};

const generateTimeSlots = (date) => {
  const startTime = new Date(date);
  startTime.setHours(10, 0, 0, 0); // Set start time to 10:00 AM
  const endTime = new Date(date);
  endTime.setHours(17, 0, 0, 0); // Set end time to 5:00 PM

  const timeSlots = [];
  let currentTime = startTime;

  while (currentTime < endTime) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + (30 * 60 * 1000)); // Add 1/2 hour

    timeSlots.push({
      startTime: slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: slotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      availableDoses: 10,
      bookedBy: []
    });

    currentTime = slotEnd;
  }

  return timeSlots;
}

module.exports = { isSlotAvailable, isSlotUpdatable, generateTimeSlots };
