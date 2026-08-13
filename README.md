# 🍱 FoodConnect – Location-Based Surplus Food Redistribution Platform

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![React 19](https://img.shields.io/badge/React-19-blue.svg)
![Firebase Cloud Firestore](https://img.shields.io/badge/Cloud%20Firestore-foodconnect--bb349-yellow.svg)
![Playwright E2E](https://img.shields.io/badge/Playwright-Chromium%20E2E-purple.svg)
![GitHub Actions CI](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD-blue.svg)

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
│  └── Firebase Admin SDK & Cloud Firestore Service Repositories               │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │ REST API (JSON / Bearer JWT)
┌──────────────────────────────────────┴──────────────────────────────────────┐
│                    Frontend Web Application & E2E Testing                   │
│  ├── React 19 + Vite + Tailwind CSS + Lucide Icons + Firebase SDK          │
│  ├── Playwright Chromium End-to-End Automated Web Testing                  │
│  └── GitHub Actions Automated CI Pipeline (.github/workflows/web-e2e.yml)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Authentication Architecture & Security Roles

1. **Normal User Authentication (`DONOR`, `RECIPIENT` / `NGO`, `VOLUNTEER`)**:
   - Normal users sign in using **Google OAuth 2.0 Sign-In** or **Email & Password**.
2. **Dedicated Administrator Authentication (`ADMIN`)**:
   - Administrators log in via the dedicated endpoint `/api/v1/auth/admin/login` using **Email & Password ONLY**.
   - **Admin Email**: `charankumarreddybantrothula@gmail.com`
   - **Admin Mobile Phone**: `9652233592`
   - **Admin Password**: `charan@123`
   - **Google Sign-In is strictly disabled** for Admin accounts to prevent unauthorized access.
   - Self-assignment of the `ADMIN` role via public registration is prohibited.

---

## 📍 Location Matching & FCM Proximity Notifications

- **Haversine Distance Engine**: Computes spatial distances in kilometers between donor pickup points, recipient organizations, and volunteers (`LocationUtils.calculateDistanceKm`).
- **Configurable Radius**: Matching radius configured via `app.matching.default-radius-km=10.0` (default 10 km).
- **Proximity Alerts**: When an NGO/recipient requests food, real-time push notifications are dispatched to nearby donors and available volunteers.

---

## 📂 Project Directory Structure

```text
FoodConnect/
├── .github/
│   └── workflows/
│       └── web-e2e.yml                        # GitHub Actions CI Workflow for Automated Web E2E Testing
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
│   ├── e2e/                                   # Playwright E2E Web Tests (Donor, Recipient, Vol, Admin)
│   ├── src/
│   │   ├── components/                        # UI Components (Layout, Header, CheckInButton)
│   │   ├── config/                            # Firebase Client SDK Configuration
│   │   ├── screens/                           # Screen Views (Donor, Recipient, Volunteer, Admin)
│   │   ├── services/                          # API Service & Fetch Clients
│   │   └── App.tsx                            # Primary Application Router & State Management
│   ├── playwright.config.ts                   # Playwright E2E Testing Config
│   └── vite.config.ts                         # Vite Build Settings
├── vercel.json                                # Vercel Monorepo Single Page App Routing Config
└── README.md                                  # Documentation & Setup Guide
```

---

## 🚀 How to Run the Project Locally

### Prerequisites

Ensure you have the following installed on your machine:
- **Java JDK 21** or later (`java -version`)
- **Node.js 18+** & npm (`node -v`)
- **Git** (`git --version`)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/charankumarReddyB/FoodConnect.git
cd FoodConnect
```

---

### Step 2: Run Backend Server (Port 8080)

```bash
cd backend

# Run Spring Boot server
mvn spring-boot:run
```

---

### Step 3: Run Frontend Web Server (Port 5173)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 🧪 Testing Suite & CI/CD Setup

### 1. Frontend Unit Tests (Vitest)
```bash
cd frontend
npm test
```

### 2. End-to-End Browser Automation Tests (Playwright & Chromium)
```bash
cd frontend

# Install Playwright browser binaries
npx playwright install chromium

# Run all Playwright E2E browser tests
npm run test:e2e
```

To open the interactive HTML test report:
```bash
npx playwright show-report
```

### 3. Backend Unit & Integration Tests (Spring Boot / JUnit 5)
```bash
cd backend
mvn test
```

### 4. GitHub Actions CI Pipeline
The automated workflow `.github/workflows/web-e2e.yml` runs on:
- Pushes to `main`
- Pull Requests to `main`
- Manual trigger via `workflow_dispatch`

It automatically sets up Java 21 & Node 20, builds the Vite web production bundle, launches Playwright Chromium headless browser, executes the full E2E test suite, and uploads test artifacts & trace logs on failure.

---

## 📄 Database Security & Firebase Rules Location

All database rule files and index definitions are maintained in `backend/src/main/resources/db/`:
- **Firestore Security Rules**: [firestore.rules](file:///c:/Charan/Food%20Connect/FoodConnect/backend/src/main/resources/db/firestore.rules)
- **Storage Security Rules**: [storage.rules](file:///c:/Charan/Food%20Connect/FoodConnect/backend/src/main/resources/db/storage.rules)
- **Firestore Composite Indexes**: [firestore.indexes.json](file:///c:/Charan/Food%20Connect/FoodConnect/backend/src/main/resources/db/firestore.indexes.json)

---

## 📜 License & Copyright

© 2026 **FoodConnect Platform**. Built for food waste reduction and social impact.
