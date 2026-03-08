const Alert = require('../models/Alert');
const User = require('../models/User');
const { dispatchAlertNotifications } = require('../services/notificationService');

const createAlert = async (req, res) => {
  try {
    const { alertType, location, description, severity } = req.body;

    if (!alertType || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Alert type, location, and description are required',
      });
    }

    const alert = await Alert.create({
      senderId: req.user._id,
      senderRole: req.user.role,
      alertType,
      location,
      description,
      severity: severity || 'Medium',
    });

    await alert.populate('senderId', 'name email role');

    const allUsers = await User.find({ isActive: true });
    console.log('Total users found:', allUsers.length);
    console.log('User emails:', allUsers.map(u => u.email));

    const io = req.app.get('io');
    io.emit('newAlert', { alert, type: 'CAMPUS_ALERT' });
    // Send push notification to all subscribers
    try {
      const { sendPushToAll } = require('../routes/push');
      sendPushToAll({
        title: `🚨 ${alert.severity} ALERT: ${alert.alertType}`,
        body: `📍 ${alert.location} — ${alert.description}`,
        url: '/',
      }).catch(console.error);
    } catch(e) {}

    dispatchAlertNotifications(alert, req.user, allUsers)
      .then(() => console.log('Notifications dispatched'))
      .catch(err => console.error('Notification error:', err.message));

    res.status(201).json({ success: true, message: 'Alert sent successfully', alert });
  } catch (error) {
    console.error('Create alert error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create alert' });
  }
};

const getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, status, alertType } = req.query;
    const filter = { isDeleted: false };
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (alertType) filter.alertType = alertType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('senderId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Alert.countDocuments(filter),
    ]);

    res.json({
      success: true,
      alerts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
};

const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, isDeleted: false })
      .populate('senderId', 'name email role');
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, isDeleted: false });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    alert.isDeleted = true;
    alert.deletedBy = req.user._id;
    alert.status = 'False Alarm';
    await alert.save();

    const io = req.app.get('io');
    io.emit('alertDeleted', { alertId: alert._id });

    res.json({ success: true, message: 'Alert marked as false alarm and removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete alert' });
  }
};

const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    if (!alert.acknowledgedBy.includes(req.user._id)) {
      alert.acknowledgedBy.push(req.user._id);
      await alert.save();
    }

    res.json({ success: true, message: 'Alert acknowledged' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createAlert, getAlerts, getAlertById, deleteAlert, acknowledgeAlert };
