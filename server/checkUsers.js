require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find().select('name email role');
  console.log('All users and roles:');
  users.forEach(u => console.log(`${u.name} | ${u.email} | ${u.role}`));
  process.exit();
});
