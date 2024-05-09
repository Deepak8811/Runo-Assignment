const express = require('express');
// const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(bodyParser.json())



const userRoute = require('./route/userRoute');
const slotRoute = require('./route/slotRoute');
const adminRoute = require('./route/adminRoute')


mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Runo_Assignment')
  .then(() => {
    console.log("I'm Connected!");
  })
  .catch((err) => {
    console.error('Connection error:', err.message);
  });


app.use('/user', userRoute);
app.use('/slot', slotRoute);
app.use('/admin', adminRoute);``


// app.use(cors());   //allows all origins
if (process.env.NODE_ENV = 'development') {
  app.use(cors({ origin: `http://localhost:3000` }))
}



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
