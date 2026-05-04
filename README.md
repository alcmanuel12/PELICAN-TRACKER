# PelicanTracker

**Real-time urban transit tracking platform**  
Final Degree Project · Web Application Development · Carmona, Seville

---

## Overview

PelicanTracker is a full-stack web application that lets passengers see a city bus position in real time, browse stops and schedules, and receive live alerts from the control room. Drivers mark checkpoint arrivals from their phones, and administrators manage the whole operation from a dedicated dashboard — all synchronized over WebSockets.

---

## Features

### Public view (passengers)
- Interactive map with animated bus position along the route
- Full timetable with automatic highlighting of the next departure per stop
- Clickable stop list with quick map navigation
- Real-time broadcast alerts from the admin panel (info / warning types)
- Read-only driver ↔ admin radio chat
- Dark / light mode, font size, and language (ES / EN) persisted in `localStorage`
- User geolocation on the map

### Admin dashboard
- **Control tower** — active driver count, live event log (last 100), elapsed service time, last stop reached
- **Alerts** — send broadcast alerts with delivery confirmation (Socket.IO ack), clear active alerts
- **User management** — create, update, and delete drivers and admins; reset passwords
- **Stop management** — full CRUD for stops (name, coordinates, checkpoint flag)

### Driver view
- List of route checkpoints with one-tap arrival confirmation
- Haptic feedback on mobile upon check-in
- Receives broadcast alerts and participates in the radio chat

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router 7 |
| Maps | Leaflet 1.9, React-Leaflet 5, CartoDB tiles (dark / light) |
| Styling | Tailwind CSS 3.4, Tailwind Merge, Lucide React |
| Real-time | Socket.IO 4.8 |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose 9 |
| Auth | JWT in httpOnly cookies, Bcrypt 6 |
| Security | express-rate-limit, XSS sanitisation, strict CORS |
| Dev tooling | Concurrently, Nodemon, ESLint 9 |

---

## Architecture

```
pelican-tracker/
├── client/                       # React + Vite frontend
│   └── src/
│       ├── App.jsx               # Routes and session restoration
│       ├── context/
│       │   └── StopsContext.jsx  # Global stops provider
│       ├── utils/
│       │   ├── api.js            # Centralised fetch wrapper
│       │   ├── routeData.js      # GeoJSON route coordinates (353 points)
│       │   ├── scheduleData.js   # Static timetable with helpers
│       │   └── translations.js   # ES / EN i18n strings
│       └── components/
│           ├── Home.jsx          # Public passenger view
│           ├── Admin/            # AdminDashboard + tabs (Control, Alerts, Users, Stops)
│           ├── Driver/           # DriverView + LoginView
│           ├── Map/              # MapView, BusMarker, RouteLayer, UserLocationMarker
│           └── UI/Cards/         # ChatPanel, ScheduleCard, StopsListCard, SettingsCard
│
├── server/
│   ├── index.js                  # Express + Socket.IO entry point
│   ├── models/
│   │   ├── User.js               # username, password, role, name
│   │   ├── Stop.js               # id, nombre, coords, isCheckpoint
│   │   └── BusState.js           # Daily singleton (simulation state)
│   └── data/
│       ├── seedStops.js          # 27 stops in Carmona (4 checkpoints)
│       ├── route.js              # Full polyline
│       └── schedule.js           # Timetable constants
│
├── test/                         # Node.js native test runner
└── package.json                  # Root scripts (concurrently)
```

---

## REST API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/login` | Public | Authenticate; sets httpOnly cookie |
| `GET` | `/api/me` | Authenticated | Restore session from cookie |
| `POST` | `/api/logout` | Authenticated | Clear token cookie |
| `GET` | `/api/stops` | Public | List stops (`?checkpoint=true` to filter) |
| `POST` | `/api/admin/stops` | Admin | Create stop |
| `PATCH` | `/api/admin/stops/:id` | Admin | Update stop |
| `DELETE` | `/api/admin/stops/:id` | Admin | Delete stop |
| `GET` | `/api/admin/users` | Admin | List users |
| `POST` | `/api/admin/users` | Admin | Create user |
| `PATCH` | `/api/admin/users/:id` | Admin | Update name, role, or password |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user |

---

## Socket.IO events

| Event | Direction | Description |
|---|---|---|
| `driverJoin` | Client → Server | Driver comes online |
| `driverUpdate` | Client → Server | Driver arrives at a checkpoint |
| `busUpdate` | Server → All | Broadcast bus position |
| `scheduleAdjust` | Server → All | Live schedule update with delay |
| `adminMessage` | Admin → Server | Send broadcast alert (with ack) |
| `adminClearAlert` | Admin → Server | Remove active alert |
| `broadcastAlert` | Server → All | Deliver alert to all clients |
| `broadcastClearAlert` | Server → All | Clear alert on all clients |
| `sendChatMessage` | Client → Server | Chat message (max 500 chars, sanitised) |
| `receiveChatMessage` | Server → All | Deliver chat message |
| `driverCountUpdate` | Server → Admin | Number of connected drivers |
| `adminLog` | Server → Admin | Real-time event log entry |

---

## Getting started

### Requirements

- Node.js ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (or a local instance)

### 1. Clone the repository

```bash
git clone https://github.com/tu-usuario/pelican-tracker.git
cd pelican-tracker
```

### 2. Environment variables

**`server/.env`**
```env
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pelicantracker
JWT_SECRET=<random_string_at_least_32_characters>
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:3000
```

### 3. Install dependencies

```bash
# All at once
npm run install:all

# Or individually
npm install                          # root (concurrently)
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 4. Seed the database (optional)

```bash
cd server && node data/seedStops.js
```

### 5. Start in development mode

```bash
npm run start:all
```

This starts the server at `http://localhost:3000` and the client at `http://localhost:5173` concurrently.

---

## Available scripts

| Command | Description |
|---|---|
| `npm run start:all` | Start server and client in parallel |
| `npm run install:all` | Install all dependencies (root + server + client) |
| `npm run server` | Server only (nodemon) |
| `npm run client` | Client only (vite) |
| `npm test` | Run tests with the Node.js native test runner |

---

## User roles

| Role | Access |
|---|---|
| `admin` | Full dashboard — control tower, alerts, user management, stop management |
| `driver` | Driver view — mark checkpoints, receive alerts, participate in chat |
| Public | Live map, timetable, stop list, read-only chat |

---

## Security

- **JWT in httpOnly cookies** — the token is never accessible from client-side JavaScript, preventing XSS-based theft.
- **Rate limiting** — maximum 10 login attempts per IP per 15 minutes.
- **Bcrypt passwords** — stored with cost factor 10; transparent migration from plaintext on first login.
- **Socket.IO auth** — the server verifies the cookie token on every WebSocket handshake.
- **XSS sanitisation** — all chat messages and alert payloads are sanitised before broadcast.
- **Strict CORS** — restricted to the origin configured in `CORS_ORIGIN`, with `credentials: true`.
- **Self-delete guard** — an admin cannot delete their own account.

---

## Academic context

Developed as a Final Degree Project for the **Web Application Development** vocational program by Manuel Alcántara. The goal is to provide passengers on the Carmona urban bus line with a modern real-time information tool. Future work includes integrating GPS hardware (Sinotrack OBD) directly with the backend to replace the current checkpoint-based simulation.

---

## License

Academic use only. All rights reserved © Manuel Alcántara.
