const { generateTimeSlots } = require("./helpers/helpers");
const Slot = require("./models/slot.model");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" })


mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('connected to the database');
}).catch(e => {
  console.error('db connection error', e);
  process.exit(1);
})


const addSlots = async () => {
  try {
    const currentDate = new Date("2024-05-01");
    // currentDate.setUTCHours(0, 0, 0, 0)
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate(); // Get the number of days in the current month
    const data = [];
    const slots = generateTimeSlots(currentDate);
    for (let i = 1; i <= numDays; i++) {
      const currentDate = new Date(year, month, i);
      currentDate.setUTCHours(0, 0, 0, 0)
      const slotData = {
        date: currentDate,
        timeSlots: slots
      };
      data.push(slotData);
    }


    const res = await Slot.insertMany(data); // Assuming Slot is your Mongoose model
    console.log(`Slots added for `);
    console.log("All slots added successfully!");
    console.log(res);
    process.exit(0);
  } catch (error) {
    console.error('Error while adding slots:', error);
    process.exit(1);
  }
}
addSlots();