# 🍲 FoodConnect - Unified Cross-Platform Platform (Android, iOS & Web)

![Android](https://img.shields.io/badge/Android-APK%2FAAB-green.svg)
![iOS](https://img.shields.io/badge/iOS-App%20Store-lightgrey.svg)
![Web App](https://img.shields.io/badge/Web%20App-PWA-blue.svg)
![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue.svg)
![Capacitor 6](https://img.shields.io/badge/Capacitor-6.0-blue.svg)
![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)

**FoodConnect** is a production-ready, location-based food donation platform designed for India to eliminate food waste by connecting food donors (restaurants, caterers, households) with NGOs, shelters, orphanages, volunteers, and recipients in real time.

This project delivers a **unified cross-platform mobile & web suite** supporting **Android App**, **iOS App**, and **Web App (PWA)** from a single frontend codebase using **Capacitor 6**.

---

## 📱 Cross-Platform Architecture

```
FoodConnect/
├── backend/                  # Spring Boot 3 Java 21 REST API
│   ├── src/main/java/        # Entities, Controllers, Services, Repositories
│   └── src/main/resources/   # db/schema.sql & db/data.sql
└── frontend/                 # React + TypeScript + Vite + Capacitor 6
    ├── android/              # Native Android Studio / Gradle project
    ├── ios/                  # Native Xcode / iOS App project
    ├── public/manifest.json  # Web App PWA Manifest
    ├── capacitor.config.ts   # Capacitor Cross-Platform Config
    └── src/                  # Unified Cross-Platform React Application
```

---

## 🌟 Key Features

### 👤 Role-Based Portals (Android, iOS & Web)
- **DONOR**: Post surplus food listings with quantity, prepared time, pickup deadline, veg/non-veg flags, and precise GPS location.
- **RECIPIENT (NGO / Shelter / Orphanage)**: Discover nearby food donations sorted by distance, request donations, and track approval status.
- **VOLUNTEER**: Claim approved donation deliveries, update delivery progress (`ASSIGNED` → `PICKED_UP` → `DELIVERED`), and build volunteer ratings.
- **ADMIN**: Platform dashboard metrics, user activation/deactivation, organization verification (e.g. Akshaya Patra, Robin Hood Army), and audit logs.

### 📍 Native Device Integration
- **Native Geolocation**: Hardware GPS location tracking across Android, iOS, and Web via `@capacitor/geolocation`.
- **Native Camera**: Photo upload for donation proof via `@capacitor/camera`.
- **Push Notifications**: Real-time delivery alerts via `@capacitor/push-notifications`.

---

## 🛠️ Technology Stack

### Backend
- **Core**: Java 21, Spring Boot 3.3.2
- **Security**: Spring Security, JWT (JSON Web Tokens), BCrypt Password Hashing
- **Data & Persistence**: Spring Data JPA, Hibernate, PostgreSQL (Supabase / Local)
- **API Documentation**: Swagger OpenAPI 3.0 (`/swagger-ui.html`)
- **Deployment**: Docker, Docker Compose, Render

### Frontend (Android, iOS & Web)
- **Framework**: React 18 + TypeScript + Vite
- **Mobile Engine**: Capacitor 6 (Android Studio & Xcode integration)
- **Styling**: Tailwind CSS & Lucide Icons

---

## 🚀 Building & Running Target Platforms

### 1. 🌐 Web App / PWA
```bash
cd frontend
npm install
npm run dev
```
> Web PWA is available at `http://localhost:5173`. Build production web assets using `npm run build`.

---

### 2. 🤖 Android App (APK / Android Studio)
```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
```
> Opens the `frontend/android` Gradle project in **Android Studio**. You can build an APK or App Bundle (`.aab`) directly for Google Play Store.

---

### 3. 🍎 iOS App (Xcode / App Store)
```bash
cd frontend
npm run build
npx cap sync ios
npx cap open ios
```
> Opens the `frontend/ios` project in **Xcode**. You can run on iOS Simulators or package for Apple App Store.

---

### 4. ☕ Backend Service & Database
```bash
cd backend
mvn spring-boot:run
```
> Or run using Docker Compose:
> `docker-compose up --build`

---

## 📄 License
This project is licensed under the Apache 2.0 License.
