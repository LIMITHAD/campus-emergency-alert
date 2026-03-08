const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const alertRoutes = require('./routes/alerts');
const panicRoutes = require('./routes/panic');
const userRoutes = require('./routes/users');

require('./config/passport')(passport);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-alert')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

app.use('/api/auth', authRoutes);
const { router: pushRoutes } = require('./routes/push');
app.use('/api/push', pushRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/panic', panicRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  socket.on('join', (data) => {
    socket.join(`user_${data.userId}`);
    socket.join(`role_${data.role}`);
  });
  socket.on('joinAdmin', () => socket.join('admins'));
  socket.on('disconnect', () => console.log('🔌 Disconnected:', socket.id));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));