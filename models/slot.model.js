const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  timeSlots: [
    {
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true
      },
      availableDoses: {
        type: Number,
        default: 10,
        validate: {
          validator: (value) => value >= 0,
          message: 'Available doses cannot be negative.'
        }
      },
      bookedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        dose: {
          type: String,
          required: true
        }
      }]
    }
  ]
});

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
