require('dotenv').config();
const nodemailer = require('nodemailer');
const https = require('https');

const sendEmailAlert = async (recipients, alertData) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Email credentials not set');
      return;
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const htmlContent = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#dc3545;padding:24px;text-align:center;">
          <h1 style="color:white;margin:0;">🚨 CAMPUS EMERGENCY ALERT</h1>
        </div>
        <div style="padding:24px;background:#f8f9fa;">
          <p><strong>Sender:</strong> ${alertData.senderName}</p>
          <p><strong>Type:</strong> ${alertData.alertType}</p>
          <p><strong>Location:</strong> ${alertData.location}</p>
          <p><strong>Description:</strong> ${alertData.description}</p>
          <p><strong>Severity:</strong> ${alertData.severity}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>`;
    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: recipient,
          subject: `🚨 Campus Alert: ${alertData.alertType} at ${alertData.location}`,
          html: htmlContent,
        });
        console.log('✉️  Email sent to:', recipient);
      } catch (err) {
        console.error('❌ Failed to send to', recipient, ':', err.message);
      }
    }
  } catch (error) {
    console.error('❌ Email error:', error.message);
  }
};

const sendSMSFast2SMS = async (phoneNumbers, alertData) => {
  try {
    if (!process.env.FAST2SMS_API_KEY) {
      console.log('❌ Fast2SMS API key not set');
      return;
    }
    const validNumbers = phoneNumbers
      .filter(p => p && p.trim())
      .map(p => p.replace(/\D/g, '').slice(-10))
      .filter(p => p.length === 10);

    if (validNumbers.length === 0) {
      console.log('⚠️ No valid phone numbers found');
      return;
    }

    const message = `CAMPUS ALERT: ${alertData.alertType} at ${alertData.location}. ${alertData.description}. Severity: ${alertData.severity}`;
    const numbersStr = validNumbers.join(',');

    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=q&message=${encodeURIComponent(message)}&language=english&flash=0&numbers=${numbersStr}`;

    await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const parsed = JSON.parse(data);
          if (parsed.return === true) {
            console.log(`📱 SMS sent to ${validNumbers.length} recipients`);
          } else {
            console.error('❌ Fast2SMS error:', parsed.message);
          }
          resolve();
        });
      }).on('error', (err) => {
        console.error('❌ SMS request error:', err.message);
        reject(err);
      });
    });
  } catch (error) {
    console.error('❌ SMS error:', error.message);
  }
};

const sendPanicEmailToAdmins = async (adminEmails, panicData) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const mapsLink = panicData.latitude && panicData.longitude
      ? `https://maps.google.com/?q=${panicData.latitude},${panicData.longitude}`
      : 'Location not available';
    const htmlContent = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#dc3545;padding:24px;text-align:center;">
          <h1 style="color:white;margin:0;">🆘 PANIC BUTTON ACTIVATED</h1>
        </div>
        <div style="padding:24px;background:#f8f9fa;">
          <p><strong>Student:</strong> ${panicData.userName}</p>
          <p><strong>Email:</strong> ${panicData.userEmail}</p>
          <p><strong>Phone:</strong> ${panicData.userPhone || 'Not provided'}</p>
          <p><strong>Description:</strong> ${panicData.description}</p>
          <p><strong>Location:</strong> <a href="${mapsLink}">View on Google Maps</a></p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>`;
    for (const email of adminEmails) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: `🆘 PANIC ALERT: ${panicData.userName} needs help`,
          html: htmlContent,
        });
        console.log('🆘 Panic email sent to admin:', email);
      } catch (err) {
        console.error('❌ Failed panic email to', email, ':', err.message);
      }
    }
  } catch (error) {
    console.error('❌ Panic email error:', error.message);
  }
};

const sendPanicSMSToAdmins = async (adminPhones, panicData) => {
  try {
    if (!process.env.FAST2SMS_API_KEY) return;
    const validNumbers = adminPhones
      .filter(p => p && p.trim())
      .map(p => p.replace(/\D/g, '').slice(-10))
      .filter(p => p.length === 10);

    if (validNumbers.length === 0) return;

    const message = `PANIC ALERT: ${panicData.userName} needs help! ${panicData.description}. Phone: ${panicData.userPhone || 'N/A'}`;
    const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=q&message=${encodeURIComponent(message)}&language=english&flash=0&numbers=${validNumbers.join(',')}`;

    await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const parsed = JSON.parse(data);
          if (parsed.return === true) {
            console.log(`📱 Panic SMS sent to ${validNumbers.length} admins`);
          } else {
            console.error('❌ Panic SMS error:', parsed.message);
          }
          resolve();
        });
      }).on('error', reject);
    });
  } catch (error) {
    console.error('❌ Panic SMS error:', error.message);
  }
};

const dispatchAlertNotifications = async (alert, sender, allUsers) => {
  console.log('📧 Dispatching notifications...');
  const emails = allUsers.map(u => u.email).filter(Boolean);
  const phones = allUsers.map(u => u.phone).filter(Boolean);
  console.log('📧 Sending to emails:', emails);
  console.log('📱 Sending to phones:', phones);

  const alertData = {
    senderName: sender.name,
    alertType: alert.alertType,
    location: alert.location,
    description: alert.description,
    severity: alert.severity,
  };

  await Promise.allSettled([
    sendEmailAlert(emails, alertData),
    sendSMSFast2SMS(phones, alertData),
  ]);
};

module.exports = {
  sendEmailAlert,
  sendSMSFast2SMS,
  sendPanicEmailToAdmins,
  sendPanicSMSToAdmins,
  dispatchAlertNotifications,
};