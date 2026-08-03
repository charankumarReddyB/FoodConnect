# FoodConnect - Location-Based Surplus Food Redistribution Platform

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![React 19](https://img.shields.io/badge/React-19-blue.svg)
![Firebase Auth](https://img.shields.io/badge/Firebase-Auth-yellow.svg)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)

**FoodConnect** is a production-ready, location-based surplus food donation and distribution platform designed to eliminate food waste by connecting food donors (restaurants, caterers, households) with NGOs, shelters, orphanages, volunteers, and recipients in real time.

---

## Clean Project Structure

The project root directory contains ONLY the necessary core folders and configuration files:

```text
c:\Charan\Food Connect
├── backend/          # Java 21 Spring Boot 3 Backend API & Firebase Admin SDK
├── frontend/         # React Web Application (Vite, TypeScript, Firebase Auth)
├── .gitignore        # Root gitignore
├── README.md         # Workspace documentation & Vercel deployment guide
└── vercel.json       # Vercel Monorepo Deployment & API Gateway rewrite config
```

---

## Deploying to Vercel

The project is configured for 1-click **Vercel Monorepo Deployment** using `vercel.json`.

### Option 1: Via Vercel Dashboard
1. Open [vercel.com/new](https://vercel.com/new).
2. Select your GitHub repository (`FoodConnect`).
3. Vercel automatically reads `vercel.json` and builds both Frontend and API gateway routing.
4. Click **Deploy**.

### Option 2: Via Vercel CLI
Run the following command from the root directory:
```powershell
npx vercel --prod
```

### Firebase Authorized Domain Configuration
Once Vercel assigns your project domain (e.g., `foodconnect.vercel.app`):
1. Open [Firebase Console](https://console.firebase.google.com/) -> **Authentication** -> **Settings** -> **Authorized domains**.
2. Add your Vercel domain (`foodconnect.vercel.app`).
