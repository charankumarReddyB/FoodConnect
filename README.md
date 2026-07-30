# 🍲 FoodConnect India - Unified Surplus Food Redistribution Platform

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![Flutter](https://img.shields.io/badge/Flutter-3.0%2B-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue.svg)
![Capacitor 6](https://img.shields.io/badge/Capacitor-6.0-blue.svg)
![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)
![Status](https://img.shields.io/badge/Production-100%25%20Verified-success.svg)

**FoodConnect** is a production-ready, location-based food donation platform designed for India to eliminate food waste by connecting food donors (restaurants, caterers, households) with NGOs, shelters, orphanages, volunteers, and recipients in real time.

---

## 🏗️ Tech Stack & Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │            Supabase PostgreSQL Online DB               │
                               │         (PostgreSQL 15+, 9 Tables, RLS Enabled)        │
                               └──────────────────────────▲─────────────────────────────┘
                                                          │ JDBC Pooled Connection (SSL)
                               ┌──────────────────────────┴─────────────────────────────┐
                               │             Java 21 Spring Boot 3 REST API             │
                               │        (Spring Security, JWT, Spring Data JPA)         │
                               └──────────────────────────▲─────────────────────────────┘
                                                          │ REST API (JSON / JWT)
                               ┌──────────────────────────┴─────────────────────────────┐
                               │                Frontend Applications                   │
                               │ ├── Flutter App (Android, iOS, Web, Tablet)            │
                               │ └── React PWA + Capacitor 6 (Android & iOS Native)    │
                               └────────────────────────────────────────────────────────┘
```

- **Backend**: Java 21, Spring Boot 3.3.2, Spring Security, Spring Data JPA, Hibernate, Maven, JWT Token Authentication.
- **Database**: Supabase PostgreSQL 15+ online hosted instance with Row Level Security (RLS) policies across 9 core tables (`users`, `organizations`, `donations`, `food_images`, `donation_requests`, `volunteers`, `deliveries`, `notifications`, `check_ins`).
- **Flutter Frontend (`frontend/flutter`)**: Single unified Flutter (Dart) codebase for Android, iOS, Web, and Tablet.
- **Web App / PWA (`frontend`)**: React + TypeScript + Vite + Capacitor 6 for cross-platform Web PWA and native Android/iOS compilation.

---

## 🌟 Key Features

- **🌐 13 Indian & International Languages**: Multilingual support for English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, Assamese, and Urdu (with RTL layout support).
- **🗺️ Geolocation & Haversine Distance Sorting**: Calculates distance in kilometers between donors, volunteers, and recipient NGOs.
- **📍 Leaflet & OpenStreetMap Navigation**: Custom interactive markers for Veg (🟢) and Non-Veg (🔴) food listings across Indian cities (Bengaluru, Hyderabad, Mumbai, Delhi, Chennai).
- **👤 4 Role-Based Portals**:
  - **DONOR**: Post surplus food listings with quantity, expiry countdown timer, and pickup location.
  - **RECIPIENT (NGO / Shelter / Orphanage)**: Discover nearby food, submit claim requests, and track approval status.
  - **VOLUNTEER**: Claim delivery jobs, complete shift check-ins, and verify pickups/deliveries via OTP codes.
  - **ADMIN**: Platform dashboard metrics, NGO verification portal, user activation toggles, and audit logs.

---

## 🚀 Getting Started Guide

### 1. Database Setup (Supabase PostgreSQL)
1. Log in to [Supabase Console](https://supabase.com/dashboard).
2. Open **SQL Editor** (`>_` icon) and create a New Query.
3. Copy all contents from [supabase_master_schema.sql](file:///c:/Charan/Food%20Connect/backend/src/main/resources/db/supabase_master_schema.sql) and click **Run** ▶️.

### 2. Backend Setup (Java 21 Spring Boot 3)
1. Copy `backend/.env.example` to `backend/.env` and update your Supabase JDBC connection credentials:
   ```env
   SPRING_PROFILES_ACTIVE=prod
   PORT=8080
   SPRING_DATASOURCE_URL=jdbc:postgresql://db.<YOUR-PROJECT-REF>.supabase.co:5432/postgres?sslmode=require
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=<YOUR-SUPABASE-PASSWORD>
   ```
2. Run the Spring Boot application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. Open Swagger API Docs at `http://localhost:8080/swagger-ui.html`.

---

### 3. Frontend Setup

#### Option A: Flutter Multi-Platform App (`frontend/flutter`)
```bash
cd frontend/flutter
flutter pub get
flutter run
```

#### Option B: React Web PWA & Capacitor (`frontend`)
```bash
cd frontend
npm install
npm run dev
```

##### Building Android APK / iOS Bundle (Capacitor)
```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
```

---

## 📄 License
Licensed under the Apache 2.0 License.
