# 🍱 FoodConnect – Location-Based Surplus Food Redistribution Platform

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![React 19](https://img.shields.io/badge/React-19-blue.svg)
![Firebase Cloud Firestore](https://img.shields.io/badge/Cloud%20Firestore-foodconnect--bb349-yellow.svg)
![Firebase Auth](https://img.shields.io/badge/Firebase%20Auth-Enabled-orange.svg)
![Firebase FCM](https://img.shields.io/badge/FCM%20Push-Enabled-red.svg)
![Vercel Live](https://img.shields.io/badge/Vercel-Live-success.svg)
![Build & Tests](https://img.shields.io/badge/Tests-44%2F44%20Backend%20Passed-brightgreen.svg)

**FoodConnect** is an enterprise-grade, location-based surplus food redistribution platform designed to eliminate food waste by connecting food donors (restaurants, caterers, hotels, households) with NGOs, shelters, orphanages, volunteers, and recipients in real time.

---

## 🌐 Live Deployment & Cloud Configuration

- **Live Web Application (Vercel)**: [https://food-connect-kz9s.vercel.app/](https://food-connect-kz9s.vercel.app/)
- **Firebase Project ID**: `foodconnect-bb349`
- **Cloud Firestore Database**: Standard Edition (`asia-south1` Mumbai region)
- **Firebase Storage Bucket**: `foodconnect-bb349.firebasestorage.app`

---

## 🏛 System Architecture & Tech Stack

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│               Firebase Cloud Services (Project: foodconnect-bb349)          │
│   ├── Cloud Firestore (NoSQL Real-time Database)                            │
│   ├── Firebase Authentication (Google OAuth, Phone OTP, Email/Password)    │
│   ├── Firebase Cloud Storage (Food & Profile Images)                        │
│   └── Firebase Cloud Messaging (FCM Push Notifications)                     │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │ Firestore Admin SDK & FCM Dispatch
┌──────────────────────────────────────┴──────────────────────────────────────┐
│                  Java 21 Spring Boot 3 Backend REST API                     │
│  ├── Spring Security + JWT Authentication Provider                          │
│  ├── Haversine Distance Proximity Engine (LocationUtils.java)               │
│  ├── Dedicated Admin Auth Controller (/api/v1/auth/admin/login)             │
│  ├── Firebase Admin SDK & Cloud Firestore Service Repositories               │
│  └── JUnit 5 & Mockito Automated Unit Test Suite (44/44 Passed)             │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │ REST API (JSON / Bearer JWT)
┌──────────────────────────────────────┴──────────────────────────────────────┐
│                    Frontend Web & Mobile Applications                       │
│  ├── React 19 + Vite + Tailwind CSS + Lucide Icons + Firebase SDK          │
│  └── Flutter Mobile & Web Application (Android, iOS, Web)                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Authentication Architecture & Security Roles

1. **Normal User Authentication (`DONOR`, `RECIPIENT` / `NGO`, `VOLUNTEER`)**:
   - Normal users sign in using **Google OAuth 2.0 Sign-In**, **Mobile Phone SMS OTP**, or **Email & Password**.
2. **Dedicated Administrator Authentication (`ADMIN`)**:
   - Administrators log in via the dedicated endpoint `/api/v1/auth/admin/login` using **Email & Password ONLY**.
   - **Admin Email**: `charankumarreddybantrothula@gmail.com`
   - **Admin Password**: `charan@123`
   - **Google Sign-In is strictly disabled** for Admin accounts to prevent unauthorized access.
   - Self-assignment of the `ADMIN` role via public registration is prohibited.

---

## 📍 Location Matching & FCM Proximity Notifications

- **Haversine Distance Engine**: Computes spatial distances in kilometers between donor pickup points, recipient organizations, and volunteers (`LocationUtils.calculateDistanceKm`).
- **Configurable Radius**: Matching radius configured via `app.matching.default-radius-km=10.0` (default 10 km).
- **Proximity Alerts**: When an NGO/recipient requests food, an FCM push notification (`"Food request available near you: An orphanage 3.2 km away is requesting food..."`) is immediately sent to nearby donors and available volunteers.

---

## 📂 Project Directory Structure

```text
FoodConnect/
├── backend/                                   # Java 21 Spring Boot 3 Backend Server
│   ├── src/main/java/com/foodconnect/
│   │   ├── config/                            # Security, Firebase, JWT Config
│   │   ├── controller/                        # REST Controllers (Auth, Donation, Request, Delivery)
│   │   ├── dto/                               # Request and Response DTOs
│   │   ├── entity/                            # JPA & Firestore Entity Models
│   │   ├── enums/                             # UserRole, DonationStatus, RequestStatus, FoodType
│   │   ├── repository/                        # JPA Repositories & Firestore Repositories
│   │   ├── service/                           # Business Logic & FCM Push Notification Service
│   │   └── util/                              # Haversine LocationUtils & JWT Helper
│   └── src/main/resources/
│       ├── application.yml                    # Spring Boot Application Properties
│       └── db/                                # Database Specs & Service Account Key
│           ├── firestore.rules                # Role-Based Cloud Firestore Security Rules
│           ├── storage.rules                  # Firebase Storage Security Rules
│           ├── firestore.indexes.json         # Firestore Composite Query Indexes
│           ├── firebase.json                  # Firebase Manifest
│           └── firebase-service-account.json  # Firebase Admin SDK Service Account Credentials
├── frontend/                                  # React 19 Web Application (Vite)
│   ├── public/                                # Favicon & Static Assets
│   ├── src/
│   │   ├── components/                        # UI Components (Layout, Header, CheckInButton)
│   │   ├── config/                            # Firebase Client SDK Configuration
│   │   ├── screens/                           # Screen Views (Donor, Recipient, Volunteer, Admin)
│   │   ├── services/                          # API Service & Fetch Clients
│   │   └── App.tsx                            # Primary Application Router & State Management
│   └── vite.config.ts                         # Vite Build Settings
├── vercel.json                                # Vercel Monorepo Single Page App Routing Config
└── README.md                                  # Documentation & Local Setup Guide
```

---

## 🚀 How to Run the Whole Project Locally

Follow these step-by-step instructions to run both the backend server and frontend application locally.

### Prerequisites

Ensure you have the following installed on your machine:
- **Java JDK 21** or later (`java -version`)
- **Node.js 18+** & npm (`node -v`)
- **Git** (`git --version`)
- Optional: **Flutter SDK 3.x** (for mobile development)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/charankumarReddyB/FoodConnect.git
cd FoodConnect
```

---

### Step 2: Set Up & Run the Spring Boot Backend (Port 8080)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Verify that `firebase-service-account.json` exists in `src/main/resources/db/firebase-service-account.json`. *(If missing, place your Firebase service account JSON key in this location).*

3. Run automated backend unit tests (optional but recommended):
   ```bash
   # On Windows (PowerShell / CMD):
   .\mvn.cmd test

   # On Linux / macOS:
   ./mvnw test
   ```

4. Start the Spring Boot Application:
   ```bash
   # On Windows (PowerShell / CMD):
   .\mvn.cmd spring-boot:run

   # On Linux / macOS:
   ./mvnw spring-boot:run
   ```

5. The backend REST API will start on **`http://localhost:8080`**.
   - API Base URL: `http://localhost:8080/api/v1`
   - Swagger / OpenAPI Docs: `http://localhost:8080/swagger-ui/index.html`

---

### Step 3: Set Up & Run the React Frontend (Port 5173)

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd FoodConnect/frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   # Or using node directly if script execution policy is restricted on Windows:
   node node_modules/npm/bin/npm-cli.js install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   # Or using node directly:
   node node_modules/vite/bin/vite.js
   ```

4. Open your browser and navigate to:
   **`http://localhost:5173`**

5. To test production build compilation:
   ```bash
   npm run build
   # Or using node directly:
   node node_modules/vite/bin/vite.js build
   ```

---

### Step 4: Run the Flutter Mobile App (Optional)

1. Navigate to the Flutter directory (if building for mobile/web):
   ```bash
   cd FoodConnect
   flutter pub get
   ```

2. Launch in Chrome Web preview or Android Emulator:
   ```bash
   flutter run -d chrome
   ```

---

## 🧪 Test Execution & Verification Summary

- **Backend JUnit 5 / Mockito Suite**: **44 tests run, 0 failures, 0 errors (100% PASS)**
- **Frontend Vite Production Build**: **Compiled `dist/` in 443ms with 0 errors**

---

## 📄 Database Security & Firebase Rules Location

All database rule files and index definitions are maintained in `backend/src/main/resources/db/`:
- **Firestore Security Rules**: [firestore.rules](file:///c:/Charan/Food%20Connect/FoodConnect/backend/src/main/resources/db/firestore.rules)
- **Storage Security Rules**: [storage.rules](file:///c:/Charan/Food%20Connect/FoodConnect/backend/src/main/resources/db/storage.rules)
- **Firestore Composite Indexes**: [firestore.indexes.json](file:///c:/Charan/Food%20Connect/FoodConnect/backend/src/main/resources/db/firestore.indexes.json)

---

## 📜 License & Copyright

© 2026 **FoodConnect Platform**. Built for food waste reduction and social impact.
