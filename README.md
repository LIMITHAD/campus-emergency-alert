# 🚨 Campus Emergency Alert and Panic Response System

A full-stack MERN application for campus safety featuring real-time emergency alerts, a panic button with GPS tracking, multi-channel notifications (Email/SMS/WhatsApp), and role-based dashboards.

---

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Socket Events](#socket-events)
- [Deployment Guide](#deployment-guide)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Email/password + Google OAuth with JWT |
| 👥 Role System | Student / Staff / Admin with RBAC |
| 📢 Campus Alerts | Real-time broadcasts to all users |
| 🆘 Panic Button | Private SOS with GPS to admins only |
| 🗺️ Location Map | Google Maps markers for panic locations |
| 📧 Email Alerts | HTML email via Nodemailer/Gmail |
| 📱 SMS Alerts | Twilio SMS to all registered phones |
| 💬 WhatsApp Alerts | Twilio WhatsApp Business messages |
| ⚡ Real-Time | Socket.io live updates |
| 🚨 Emergency Overlay | Full-screen flashing alert with sound |

---

## 🛠️ Tech Stack

**Backend:** Node.js · Express · MongoDB · Mongoose · Socket.io · JWT · Passport  
**Frontend:** React · Bootstrap 5 · Axios · React Router v6 · Socket.io Client  
**Services:** Nodemailer (Gmail) · Twilio (SMS + WhatsApp) · Google OAuth · Google Maps

---

## 📁 Project Structure

```
campus-alert/
├── server/                     # Backend (Node.js/Express)
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── passport.js         # Google OAuth strategy
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, OAuth
│   │   ├── alertController.js  # CRUD for alerts
│   │   └── panicController.js  # Panic requests
│   ├── middleware/
│   │   └── auth.js             # JWT protect + authorize
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Alert.js            # Alert schema
│   │   └── PanicRequest.js     # Panic schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── alerts.js
│   │   ├── panic.js
│   │   └── users.js
│   ├── services/
│   │   └── notificationService.js  # Email, SMS, WhatsApp
│   ├── server.js               # Entry point + Socket.io
│   └── .env.example
│
└── client/                     # Frontend (React)
    └── src/
        ├── components/
        │   ├── Navbar/         # Top navigation
        │   ├── AlertCard/      # Alert display card
        │   ├── SOSButton/      # Animated panic button
        │   ├── EmergencyOverlay/  # Full-screen flash alert
        │   └── ProtectedRoute.js
        ├── context/
        │   ├── AuthContext.js  # Auth state
        │   └── AlertContext.js # Real-time alert state
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── StudentDashboard.js
        │   ├── StaffDashboard.js
        │   ├── AdminDashboard.js
        │   ├── SendAlert.js
        │   └── PanicPage.js
        └── services/
            ├── api.js          # Axios instance + endpoints
            └── socket.js       # Socket.io client
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** v6+ (local or MongoDB Atlas)
- **npm** v9+
- Google Cloud Console account (for OAuth + Maps)
- Twilio account (for SMS/WhatsApp)
- Gmail app password (for email)

---

## 🚀 Setup Instructions

### 1. Clone / Download the Project

```bash
git clone <your-repo-url> campus-alert
cd campus-alert
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Configure Backend Environment

```bash
cd ../server
cp .env.example .env
# Now edit .env with your values (see Environment Variables section)
```

### 5. Configure Frontend Environment

```bash
cd ../client
cp .env.example .env
# Edit .env with your Google client ID and Maps key
```

### 6. Start MongoDB

```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas (update MONGO_URI in .env)
```

### 7. Create First Admin User

After starting the server, use this script to make an admin:

```bash
# In server/
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  await User.findOneAndUpdate(
    { email: 'admin@campus.edu' },
    { role: 'admin' }
  );
  console.log('Admin role assigned');
  process.exit();
});
"
```

Or use MongoDB Compass to manually set `role: 'admin'` on a user.

### 8. Run Both Servers (Development)

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
# App running on http://localhost:3000
```

---

## 🔑 Environment Variables

### Server (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/campus-alert

# JWT (use a strong random string)
JWT_SECRET=your_256bit_random_secret_here
JWT_EXPIRE=7d

# Google OAuth
# Get from: https://console.cloud.google.com → APIs & Services → Credentials
GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
CLIENT_URL=http://localhost:3000

# Gmail (use App Password, not your real password)
# Enable 2FA → Google Account → Security → App Passwords
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=CampusAlert <youremail@gmail.com>

# Twilio (from https://console.twilio.com)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Client (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

---

## 🔧 Setting Up External Services

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google+ API** and **Google OAuth2 API**
4. Go to **Credentials → Create OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
7. Copy Client ID and Secret to `.env`

### Google Maps API

1. In Google Cloud Console, enable **Maps JavaScript API**
2. Go to **Credentials → Create API Key**
3. (Optional) Restrict to your domain
4. Copy key to `REACT_APP_GOOGLE_MAPS_API_KEY`

### Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Select app: **Mail**, device: **Other** → name it "CampusAlert"
4. Copy the 16-character password to `EMAIL_PASS`

### Twilio SMS & WhatsApp

1. Sign up at [twilio.com](https://twilio.com)
2. Get your **Account SID** and **Auth Token** from the console
3. Buy a phone number for SMS (`TWILIO_PHONE_NUMBER`)
4. For WhatsApp: join the Twilio Sandbox or apply for Business API
   - Sandbox number is `+14155238886` (users must opt in first)

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Email/password login | Public |
| GET | `/api/auth/me` | Get current user | JWT |
| GET | `/api/auth/google` | Start Google OAuth | Public |
| GET | `/api/auth/google/callback` | OAuth callback | Public |

### Alerts
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/api/alerts` | List all alerts | All |
| POST | `/api/alerts` | Create alert | Student/Staff/Admin |
| GET | `/api/alerts/:id` | Get alert | All |
| DELETE | `/api/alerts/:id` | Delete (false alarm) | Admin |
| POST | `/api/alerts/:id/acknowledge` | Acknowledge | All |

### Panic
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/api/panic` | Submit panic | Student |
| GET | `/api/panic` | List all panics | Admin |
| GET | `/api/panic/my` | My panics | Student |
| PUT | `/api/panic/:id/status` | Update status | Admin |

### Users
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/api/users` | List all users | Admin |
| PUT | `/api/users/:id/role` | Update role | Admin |
| PUT | `/api/users/:id/toggle` | Toggle active | Admin |

---

## ⚡ Socket Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `join` | `{ userId, role }` | Join role rooms |
| `joinAdmin` | — | Join admin-only room |

### Server → Client
| Event | Payload | Audience |
|---|---|---|
| `newAlert` | `{ alert }` | All users |
| `alertDeleted` | `{ alertId }` | All users |
| `newPanicRequest` | `{ panic, user }` | Admins only |
| `panicUpdated` | `panic object` | Admins only |
| `panicStatusUpdate` | `{ panicId, status, message }` | Student who submitted |

---

## 🚀 Deployment Guide

### Option A: Traditional VPS (DigitalOcean, Linode, AWS EC2)

**1. Build Frontend**
```bash
cd client
npm run build
# Creates client/build/ folder
```

**2. Serve from Node backend**
```js
// Add to server.js
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
```

**3. Use PM2 for process management**
```bash
npm install -g pm2
cd server
pm2 start server.js --name campus-alert
pm2 startup
pm2 save
```

**4. Nginx config**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**5. SSL with Certbot**
```bash
sudo certbot --nginx -d yourdomain.com
```

### Option B: Render.com (Free tier)

1. Push code to GitHub
2. Create two Render services:
   - **Backend**: Node.js service, root = `server/`, start = `node server.js`
   - **Frontend**: Static site, root = `client/`, build = `npm run build`, publish = `build`
3. Set environment variables in Render dashboard
4. Update `REACT_APP_API_URL` to your Render backend URL

### Option C: Vercel + Railway

- **Frontend**: Deploy `client/` to Vercel
- **Backend**: Deploy `server/` to Railway
- **Database**: Use MongoDB Atlas (free 512MB)

---

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string (32+ chars)
- [ ] Use HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Restrict MongoDB to specific IPs in Atlas
- [ ] Enable rate limiting (`express-rate-limit`)
- [ ] Restrict Google Maps API key to your domain
- [ ] Set `CLIENT_URL` to your production frontend URL

---

## 🐛 Troubleshooting

**MongoDB connection fails**
```bash
# Check MongoDB is running
sudo systemctl status mongod
# Start it
sudo systemctl start mongod
```

**Emails not sending**
- Ensure 2FA is enabled on Gmail
- Use App Password (16 chars), not your regular password
- Check spam folder

**Google OAuth redirect error**
- Add `http://localhost:5000/api/auth/google/callback` to authorized redirect URIs
- Ensure `GOOGLE_CLIENT_ID` matches your Google Cloud Console credentials

**Socket.io connection issues**
- Ensure CORS `origin` in server.js matches your frontend URL exactly
- For production, update `REACT_APP_SOCKET_URL`

---

## 📄 License

MIT License — Free to use for educational and campus safety purposes.

---

*Built with ❤️ for campus safety. In a real emergency, always call 911 first.*
