# FoodStallReview

A React Native food stall discovery and review app with a real-time cloud backend.

- Browse and search food stalls by cuisine or location
- Read and write reviews with live updates via Socket.IO
- Admin panel for managing stall listings
- Light / Dark / Auto theme support

**Stack:** React Native 0.73 · Express · Socket.IO · MongoDB Atlas · Railway

---

## Prerequisites

Make sure the following are installed before you begin:

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | `node --version` |
| JDK | 17 | Required by Android build tools |
| Android Studio | Latest | Includes emulator + SDK |
| Android SDK | API 34 | Install via Android Studio SDK Manager |

---

## 1. Clone and Install

```bash
git clone <repo-url>
cd FoodStallReview
npm install --legacy-peer-deps
```

> **Important:** Always use `--legacy-peer-deps`. Package versions are pinned for
> React Native 0.73 compatibility. Plain `npm install` may pull in breaking versions.

---

## 2. Set Up MongoDB Atlas

The database is hosted on MongoDB Atlas (free tier). You need your own cluster.

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create a free **M0** cluster
2. **Database Access** → Add a database user (set a username and password)
3. **Network Access** → Add IP `0.0.0.0/0` (allow connections from anywhere)
4. **Connect** → Drivers → Copy the connection string

---

## 3. Create the `.env` File

`.env` is gitignored and must be created manually. Copy the template:

```bash
copy .env.example .env
```

Then open `.env` and fill in your Atlas connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/foodstall
PORT=5000
```

Replace `<username>`, `<password>`, and `<cluster>` with your Atlas credentials.

---

## 4. Seed the Database

Populate MongoDB with demo stalls, users, and reviews:

```bash
npm run seed
```

This creates:

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@foodstall.com    | Admin123  |
| User  | user@foodstall.com     | Password1 |

---

## 5. Start the Backend Server

```bash
npm run server
```

The server runs on port 5000 (REST + Socket.IO on the same port).

Keep this terminal open while running the app.

---

## 6. Run the Android App

Open a **second terminal** and start Metro:

```bash
npm start
```

Open a **third terminal** and launch on the emulator:

```bash
npm run android
```

The emulator connects to the server at `http://10.0.2.2:5000` (Android's alias for localhost). No changes to `config.js` needed for emulator testing.

> **Physical device?** Replace `serverPath` in `config.js` with your machine's LAN IP,
> e.g. `http://192.168.1.x:5000`. Make sure both devices are on the same Wi-Fi network.

---

## Project Structure

```
FoodStallReview/
├── service.js              ← Express + Socket.IO server
├── generateDatabase.js     ← MongoDB seed script
├── config.js               ← Client server URL config
├── .env                    ← Secret credentials (gitignored — create manually)
├── .env.example            ← Template for .env
├── models/                 ← Mongoose schemas (User, Stall, Review)
├── api/                    ← REST fetch wrappers + Socket.IO client
├── screens/                ← React Native screens
├── components/             ← Reusable UI components
├── navigation/             ← Drawer + Tab navigators
└── theme/                  ← Theme context, colors, useTheme hook
```

---

## Useful Commands

```bash
npm install --legacy-peer-deps          # Install dependencies
npm run server                          # Start backend server
npm run seed                            # Seed MongoDB with demo data
npm start                               # Start Metro bundler
npm run android                         # Run on Android emulator
npx react-native start --reset-cache    # Metro with clean cache (after babel changes)
```

---

## Troubleshooting

**`Cannot find module 'dotenv'` when running seed/server**
→ Run `npm install --legacy-peer-deps` first.

**`[reanimated] failed to create a worklet`**
→ Run `npx react-native start --reset-cache` to clear the Metro cache.

**`Command run-android unrecognized`**
→ Use `npx react-native run-android` or run `npm install --legacy-peer-deps` again.

**App shows "Connection Error"**
→ Make sure `npm run server` is running in a separate terminal before launching the app.

**Emulator can't reach server**
→ Confirm `config.js` has `serverPath: 'http://10.0.2.2:5000'` for emulator testing.
