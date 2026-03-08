const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const { protect } = require('../middleware/auth');

// Store subscriptions in memory (or you can add a DB model)
let subscriptions = [];

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@campus.edu',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// @route POST /api/push/subscribe
// @desc  Save push subscription
router.post('/subscribe', protect, (req, res) => {
  const subscription = req.body;
  const userId = req.user._id.toString();

  // Remove old subscription for this user
  subscriptions = subscriptions.filter(s => s.userId !== userId);

  // Save new subscription
  subscriptions.push({ userId, subscription });

  console.log(`🔔 Push subscription saved for user: ${req.user.email}`);
  res.status(201).json({ success: true, message: 'Subscribed to push notifications' });
});

// @route DELETE /api/push/unsubscribe
// @desc  Remove push subscription
router.delete('/unsubscribe', protect, (req, res) => {
  const userId = req.user._id.toString();
  subscriptions = subscriptions.filter(s => s.userId !== userId);
  res.json({ success: true, message: 'Unsubscribed' });
});

// @route GET /api/push/vapid-public-key
// @desc  Get VAPID public key for client
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Helper: send push to all subscribers
const sendPushToAll = async (payload) => {
  const results = await Promise.allSettled(
    subscriptions.map(({ subscription }) =>
      webpush.sendNotification(subscription, JSON.stringify(payload))
    )
  );

  // Clean up dead subscriptions
  const failed = [];
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.warn('❌ Push failed, removing subscription');
      failed.push(subscriptions[i].userId);
    }
  });
  subscriptions = subscriptions.filter(s => !failed.includes(s.userId));

  console.log(`🔔 Push sent to ${subscriptions.length} subscribers`);
};

// Helper: send push to specific user
const sendPushToUser = async (userId, payload) => {
  const sub = subscriptions.find(s => s.userId === userId.toString());
  if (!sub) return;
  try {
    await webpush.sendNotification(sub.subscription, JSON.stringify(payload));
  } catch (e) {
    subscriptions = subscriptions.filter(s => s.userId !== userId.toString());
  }
};

module.exports = { router, sendPushToAll, sendPushToUser };