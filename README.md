# FoodConnect - Location-Based Surplus Food Redistribution Platform

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![React 19](https://img.shields.io/badge/React-19-blue.svg)
![Firebase Auth](https://img.shields.io/badge/Firebase-Auth--foodconnect--bb349-yellow.svg)
![Vercel Live](https://img.shields.io/badge/Vercel-Live-success.svg)
![Build & Tests](https://img.shields.io/badge/Tests-18%2F18%20Passed-brightgreen.svg)

**FoodConnect** is a production-ready, location-based surplus food donation and distribution platform designed to eliminate food waste by connecting food donors (restaurants, caterers, households) with NGOs, shelters, orphanages, volunteers, and recipients in real time.

---

## Live Deployment

- **Vercel Web App**: [https://food-connect-kz9s.vercel.app/](https://food-connect-kz9s.vercel.app/)
- **Firebase Project ID**: `foodconnect-bb349`

---

## Key Features & Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Supabase PostgreSQL / H2 Database                  │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │ JDBC / JPA
┌────────────────────────────────────┴────────────────────────────────────┐
│              Java 21 Spring Boot 3 Backend REST API                     │
│     (Spring Security, Firebase Admin SDK, JWT Provider, Lombok, Maven)   │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │ REST API (JSON / Bearer JWT)
┌────────────────────────────────────┴────────────────────────────────────┐
│                   Frontend Client Applications                          │
│  ├── React 19 Web + Vite + Tailwind CSS + Firebase Auth Web SDK        │
│  └── Flutter App (Android, iOS, Web, Tablet)                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Authentication Architecture
1. **Firebase Phone Authentication**: Real-time phone validation, reCAPTCHA verification, 6-digit OTP confirmation, and Firebase ID Token generation.
2. **Google OAuth Sign-In**: Firebase `signInWithPopup` integration.
3. **Backend Firebase Admin SDK**: Spring Boot verifies Firebase ID Tokens on `/api/v1/auth/firebase` before issuing application JWT access and refresh tokens.
4. **Session Persistence**: Restores session from `localStorage` / `SharedPreferences` on page refresh and routes to role-based dashboards (`DONOR`, `NGO`, `VOLUNTEER`, `ADMIN`).
5. **Email / Password Security**: BCrypt password hashing, refresh token rotation, and password reset token flow.

---

## Clean Project Structure

```text
c:\Charan\Food Connect
├── backend/          # Java 21 Spring Boot 3 Backend API & Firebase Admin SDK
├── frontend/         # React Web Application (Vite, TypeScript, Firebase Auth)
├── .gitignore        # Root gitignore
├── README.md         # Full project documentation & deployment guide
└── vercel.json       # Vercel Monorepo deployment & API routing rules
```

---

## Deployment Guide

### Frontend Deployment (Vercel)

The repository includes a root `vercel.json` pre-configured for **Vercel Monorepo Deployment**:

```powershell
# Deploy from root directory using Vercel CLI:
npx vercel --prod
```

#### Firebase Authorized Domain
Ensure `food-connect-kz9s.vercel.app` is authorized in:
[Firebase Console](https://console.firebase.google.com/) -> **Authentication -> Settings -> Authorized domains**.

---

## Verification & Test Results

- **Backend Automated Test Suite**: `.\mvnw test` — **18/18 tests passed (`BUILD SUCCESS`)**.
- **React Frontend Typecheck**: `npx tsc --noEmit` — **0 errors**.
- **Production Build**: `npm run build` — **Built cleanly in 589ms**.
