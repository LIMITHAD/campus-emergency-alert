const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['student', 'staff', 'admin'],
      required: true,
    },
    alertType: {
      type: String,
      required: [true, 'Alert type is required'],
      enum: ['Fire', 'Security Threat', 'Power Outage', 'Medical Emergency', 'Campus Hazard', 'Weather Emergency', 'Other'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved', 'False Alarm'],
      default: 'Active',
    },
    acknowledgedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);