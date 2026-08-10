# FoodConnect - Location-Based Surplus Food Redistribution Platform

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![React 19](https://img.shields.io/badge/React-19-blue.svg)
![Firebase Cloud Firestore](https://img.shields.io/badge/Cloud%20Firestore-foodconnect--bb349-yellow.svg)
![Firebase Storage](https://img.shields.io/badge/Firebase%20Storage-Enabled-blue.svg)
![Vercel Live](https://img.shields.io/badge/Vercel-Live-success.svg)
![Build & Tests](https://img.shields.io/badge/Tests-56%2F56%20Passed-brightgreen.svg)

**FoodConnect** is a production-ready, location-based surplus food donation and distribution platform designed to eliminate food waste by connecting food donors (restaurants, caterers, households) with NGOs, shelters, orphanages, volunteers, and recipients in real time.

---

## Live Deployment & Cloud Resources

- **Vercel Web App**: [https://food-connect-kz9s.vercel.app/](https://food-connect-kz9s.vercel.app/)
- **Firebase Project ID**: `foodconnect-bb349`
- **Firebase Storage Bucket**: `foodconnect-bb349.firebasestorage.app`

---

## Architecture & Technology Stack

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              Firebase Cloud Firestore & Firebase Storage                │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │ Firestore SDK & REST Sync
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

### Key Services & Configuration
1. **Firebase Authentication**: Real-time phone validation, reCAPTCHA verification, 6-digit OTP confirmation, and Google Sign-In.
2. **Cloud Firestore**: Primary NoSQL cloud database storing `users`, `organizations`, `donations`, `donation_requests`, `deliveries`, `volunteers`, `check_ins`, `activity_logs`, and `notifications`.
3. **Firebase Cloud Storage**: Storage bucket for food photos, user profile pictures, and organization verifications.
4. **Spring Boot Backend**: Java 21 REST API managing business logic, role-based authorization, matching algorithms, and security filters.
5. **Vercel Web Deployment**: Single Page Application hosting for React Web with rewrite rules.

---

## Clean Project Structure

```text
c:\Charan\Food Connect
├── backend/          # Java 21 Spring Boot 3 Backend API, Firestore Repositories, & Firebase Admin SDK
│   └── src/main/resources/firebase/   # Cloud Firestore Rules, Storage Rules, and Indexes
├── frontend/         # React Web Application (Vite, TypeScript, Firebase Auth & Storage)
├── firestore.rules   # Cloud Firestore Security Rules
├── storage.rules     # Firebase Storage Security Rules
├── firebase.json     # Firebase Project Configuration
├── vercel.json       # Vercel Monorepo deployment & API routing rules
└── README.md         # Full project documentation & deployment guide
```

---

## Automated Test Execution

Run backend Java 21 JUnit test suite:
```powershell
cd backend
.\mvn.cmd test
```

Run frontend React test suite:
```powershell
cd frontend
npm run test
```
