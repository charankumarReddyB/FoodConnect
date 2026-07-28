# 🍲 FoodConnect - Unified Cross-Platform Platform (Android, iOS & Web)

![Android](https://img.shields.io/badge/Android-APK%2FAAB-green.svg)
![iOS](https://img.shields.io/badge/iOS-App%20Store-lightgrey.svg)
![Web App](https://img.shields.io/badge/Web%20App-PWA-blue.svg)
![Map](https://img.shields.io/badge/Real%20Map-OpenStreetMap-brightgreen.svg)
![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue.svg)
![Capacitor 6](https://img.shields.io/badge/Capacitor-6.0-blue.svg)
![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)

**FoodConnect** is a production-ready, location-based food donation platform designed for India to eliminate food waste by connecting food donors (restaurants, caterers, households) with NGOs, shelters, orphanages, volunteers, and recipients in real time.

This project features a **real interactive map (Leaflet & OpenStreetMap)** for nearby food discovery, and delivers a **unified cross-platform mobile & web suite** supporting **Android App**, **iOS App**, and **Web App (PWA)** using **Capacitor 6**.

---

## 🗺️ Real Interactive Map & Geolocation

- **Live OpenStreetMap Rendering**: Real-time map tiles rendering interactive GPS locations across India (Bengaluru, Hyderabad, Mumbai, Delhi, Chennai).
- **Custom Interactive Markers**: Dynamic Leaflet markers featuring Veg (🟢) and Non-Veg (🔴) indicators, donor names, quantities, and real-time popups.
- **GPS Location Centering**: Native device location centering via browser API and `@capacitor/geolocation`.
- **Haversine Distance Sorting**: Backend Haversine formula calculates exact distance in kilometers:
$$\text{distance} = 6371 \times \arccos\left(\sin(\phi_1)\sin(\phi_2) + \cos(\phi_1)\cos(\phi_2)\cos(\Delta\lambda)\right)$$

---

## 📱 Cross-Platform Architecture

```
FoodConnect/
├── backend/                  # Spring Boot 3 Java 21 REST API
│   ├── src/main/java/        # Entities, Controllers, Services, Repositories
│   └── src/main/resources/   # db/schema.sql & db/data.sql
└── frontend/                 # React + TypeScript + Vite + Capacitor 6 + Leaflet
    ├── android/              # Native Android Studio / Gradle project
    ├── ios/                  # Native Xcode / iOS App project
    ├── public/manifest.json  # Web App PWA Manifest
    ├── capacitor.config.ts   # Capacitor Cross-Platform Config
    └── src/                  # Unified React UI Codebase (Leaflet Maps & Dashboards)
```

---

## 🌟 Key Features

### 👤 Role-Based Portals (Android, iOS & Web)
- **DONOR**: Post surplus food listings with quantity, prepared time, pickup deadline, veg/non-veg flags, and precise GPS location.
- **RECIPIENT (NGO / Shelter / Orphanage)**: Discover nearby food donations sorted by distance, request donations, and track approval status.
- **VOLUNTEER**: Claim approved donation deliveries, update delivery progress (`ASSIGNED` → `PICKED_UP` → `DELIVERED`), and build volunteer ratings.
- **ADMIN**: Platform dashboard metrics, user activation/deactivation, organization verification (e.g. Akshaya Patra, Robin Hood Army), and audit logs.

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
