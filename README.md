# Lumina Logistics

🚀 Live Demo: [Lumina Logistics](https://lumina-logistics-ten.vercel.app/)

**Smart AI-Powered Shipment & Delivery Management Platform**

A full-stack MERN application for booking, tracking, and managing logistics operations — built as a placement-worthy portfolio project with realistic AI features, role-based dashboards, and real-time updates.

![Tech Stack](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react)
![Node](https://img.shields.io/badge/Node-Express-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)

## Screenshots

> Add screenshots of: Landing page, Customer dashboard, Track page, Admin analytics, Driver map view

## Features

### Core
- **4 User Roles**: Customer, Driver, Admin, Warehouse Manager
- **JWT Authentication** with register, login, forgot/reset password, email verification
- **Shipment lifecycle**: Pending → Picked Up → Warehouse → In Transit → Out for Delivery → Delivered
- **Real-time updates** via Socket.io (status, notifications, driver location)
- **Leaflet maps** for pickup, drop, and live tracking
- **Razorpay payments** (real UPI, card, netbanking in test/live mode) + COD
- **QR code tracking** on shipment details

### AI Features (Interview-friendly)
1. **ETA Prediction** — distance, traffic, weather factors + confidence %
2. **Delay Detection** — inactive shipments & past ETA alerts
3. **Lumina AI Chatbot** — OpenAI-powered (fallback without API key)
4. **Route Suggestions** — fastest, shortest, fuel-efficient
5. **Admin AI Insights** — peak hours, top drivers, revenue projection

### UI/UX
- Dark/light mode, glassmorphism, Framer Motion animations
- Responsive dashboards with Recharts analytics
- React Hot Toast notifications

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, React Router, Axios, Socket.io-client, Leaflet, Recharts |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, Socket.io, Nodemailer, Cloudinary |
| Deploy | Vercel (client), Render (server), MongoDB Atlas |

## Project Structure

```
project1/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── context/
│       ├── services/
│       └── routes/
├── server/          # Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/    # AI logic
│   └── sockets/
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & install

```bash
cd project1/server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

cd ../client
npm install
cp .env.example .env
```

### 2. Environment variables

**server/.env**
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=sk-...   # optional for chatbot
SMTP_USER=...           # optional for emails
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=... # see RAZORPAY_SETUP.md
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed database

```bash
cd server
npm run seed
```

### 4. Run locally

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Open http://localhost:5173

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lumina.com | admin123 |
| Customer | customer@lumina.com | customer123 |
| Driver | driver@lumina.com | driver123 |
| Warehouse | warehouse@lumina.com | warehouse123 |

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Register user |
| `POST /api/auth/login` | Login |
| `GET /api/shipments/track/:id` | Public tracking |
| `POST /api/shipments` | Book shipment |
| `PUT /api/shipments/:id/status` | Update status |
| `GET /api/admin/stats` | Admin analytics |
| `POST /api/chat/message` | AI chatbot |

## Deployment

### MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Add database user + whitelist IP `0.0.0.0/0` (for Render)
3. Copy connection string to `MONGO_URI`

### Backend (Render)
1. New Web Service → connect repo → root: `server`
2. Build: `npm install` | Start: `npm start`
3. Add all env vars from `.env.example`
4. Set `CLIENT_URL` to your Vercel URL

### Frontend (Vercel)
1. Import repo → root: `client`
2. Build: `npm run build` | Output: `dist`
3. Env: `VITE_API_URL=https://your-api.onrender.com/api`
4. Env: `VITE_SOCKET_URL=https://your-api.onrender.com`

## Interview Talking Points

- **Architecture**: MVC on backend, context + service layer on frontend
- **Auth**: JWT in httpOnly cookie + Bearer header, role middleware
- **Real-time**: Socket.io rooms per shipment/user
- **AI**: Rule-based ETA/delay (explainable) + optional OpenAI for chat
- **Security**: Helmet, rate limiting, bcrypt, mongo sanitize

## Future Improvements

- [ ] Google Maps API integration
- [x] Razorpay payments (see RAZORPAY_SETUP.md)
- [ ] Push notifications (FCM)
- [ ] PDF invoice generation with jsPDF
- [ ] Unit tests with Jest

## Author

Built as a 2nd-year CS portfolio project demonstrating MERN fundamentals + modern UI + AI integrations.

**Lumina Logistics** — Ship Smarter. Track Faster. Deliver Better.
