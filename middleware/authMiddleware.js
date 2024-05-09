// authenticationMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization;
  // console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const t=token.slice(7,token.length);
  // console.log(t);
  try {
    const decoded = jwt.verify(t, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    // console.log(user);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = { userId: user._id }; // Attach user information to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
