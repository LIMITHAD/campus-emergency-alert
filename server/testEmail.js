require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET ✅' : 'NOT SET ❌');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'CampusAlert Test Email',
  text: 'If you see this, email is working!',
}).then(() => {
  console.log('SUCCESS - Email sent! Check your inbox.');
  process.exit();
}).catch(err => {
  console.log('FAILED - Error:', err.message);
  process.exit();
});
