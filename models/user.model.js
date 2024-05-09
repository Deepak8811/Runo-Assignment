const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:
  {
    type: String,
    required: true
  },
  phoneNumber:
  {
    type: String,
    required: true,
    unique: true
  },
  age:
  {
    type: Number,
    required: true
  },
  pincode:
  {
    type: String,
    required: true
  },
  aadharNo:
  {
    type: String,
    required: true,
    unique: true
  },
  password:
  {
    type: String,
    required: true
  },
  firstDoseRegistered:
  {
    type: Boolean,
    default: false
  },
  secondDoseRegistered:
  {
    type: Boolean,
    default: false
  },
  firstDoseDateTime:
  {
    type: Date
  },
  secondDoseDateTime:
  {
    type: Date
  },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema);
