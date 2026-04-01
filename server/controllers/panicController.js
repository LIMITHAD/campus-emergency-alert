const PanicRequest = require('../models/PanicRequest');
const User = require('../models/User');
const { sendPanicEmailToAdmins } = require('../services/notificationService');

const createPanicRequest = async (req, res) => {
  try {
    const { description, latitude, longitude } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, message: 'Please describe your emergency' });
    }
    const panic = await PanicRequest.create({
      userId: req.user._id,
      description,
      latitude: latitude || null,
      longitude: longitude || null,
    });
    await panic.populate('userId', 'name email phone role');
    const io = req.app.get('io');
    io.to('admins').emit('newPanicRequest', {
      panic,
      user: { name: req.user.name, email: req.user.email, phone: req.user.phone },
    });
    const admins = await User.find({ role: 'admin', isActive: true });
    const adminEmails = admins.map(a => a.email);
    if (adminEmails.length > 0) {
      sendPanicEmailToAdmins(adminEmails, {
        userName: req.user.name,
        userEmail: req.user.email,
        userPhone: req.user.phone,
        description,
        latitude,
        longitude,
      }).catch(console.error);
    }
    res.status(201).json({ success: true, message: 'Panic request sent. Help is on the way.', panic });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send panic request' });
  }
};

const getPanicRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [requests, total] = await Promise.all([
      PanicRequest.find(filter)
        .populate('userId', 'name email phone role')
        .populate('resolvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PanicRequest.countDocuments(filter),
    ]);
    res.json({ success: true, requests, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch panic requests' });
  }
};

const updatePanicStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const panic = await PanicRequest.findById(req.params.id);
    if (!panic) return res.status(404).json({ success: false, message: 'Panic request not found' });
    panic.status = status;
    if (notes) panic.notes = notes;
    if (status === 'Resolved') {
      panic.resolvedBy = req.user._id;
      panic.resolvedAt = new Date();
    }
    await panic.save();
    await panic.populate('userId', 'name email phone');
    const io = req.app.get('io');
    io.to(`user_${panic.userId._id}`).emit('panicStatusUpdate', {
      panicId: panic._id,
      status: panic.status,
      message: status === 'Resolved'
        ? 'Your emergency request has been resolved. Stay safe!'
        : `Your emergency request is now: ${status}`,
    });
    io.to('admins').emit('panicUpdated', panic);
    res.json({ success: true, message: `Panic request updated to ${status}`, panic });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update panic request' });
  }
};

const deletePanic = async (req, res) => {
  try {
    const panic = await PanicRequest.findById(req.params.id);
    if (!panic) {
      return res.status(404).json({ success: false, message: 'Panic request not found' });
    }
    await PanicRequest.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    io.to('admins').emit('panicDeleted', { panicId: req.params.id });
    res.json({ success: true, message: 'Panic request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete panic request' });
  }
};

const getMyPanicRequests = async (req, res) => {
  try {
    const requests = await PanicRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createPanicRequest, getPanicRequests, updatePanicStatus, getMyPanicRequests, deletePanic };