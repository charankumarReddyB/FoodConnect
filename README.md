# FoodConnect - Location-Based Surplus Food Redistribution Platform

![Java 21/25](https://img.shields.io/badge/Java-21%2F25-orange.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![React 18](https://img.shields.io/badge/React-18-blue.svg)
![Flutter](https://img.shields.io/badge/Flutter-3.0%2B-blue.svg)
![PostgreSQL / H2](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20H2-blue.svg)
![Build & Security](https://img.shields.io/badge/Security-E2E%20Verified%20%26%20Tested-success.svg)
![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)

**FoodConnect** is a production-ready, location-based surplus food donation and distribution platform designed to eliminate food waste by connecting food donors (restaurants, caterers, households) with NGOs, shelters, orphanages, volunteers, and recipients in real time.

---

## Architecture & Tech Stack

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                   PostgreSQL (Supabase) / H2 DB                         │
 └────────────────────────────────────▲────────────────────────────────────┘
                                      │ JDBC / JPA
 ┌────────────────────────────────────┴────────────────────────────────────┐
 │              Java Spring Boot 3 Backend REST API                        │
 │     (Spring Security, JWT Token Provider, SMS Service, Lombok, Maven)   │
 └────────────────────────────────────▲────────────────────────────────────┘
                                      │ REST API (JSON / Bearer JWT)
 ┌────────────────────────────────────┴────────────────────────────────────┐
 │                     Frontend Client Applications                        │
 │  ├── React Web + Vite + Tailwind CSS + Capacitor 6 (Web PWA / Android) │
 │  └── Flutter App (Android, iOS, Web, Tablet)                            │
 └─────────────────────────────────────────────────────────────────────────┘
```

### Core Technologies
- **Backend Framework**: Java 21/25, Spring Boot 3.3.2, Spring Security, Spring Data JPA, Hibernate ORM, Maven.
- **Database Support**: PostgreSQL (Production) + Embedded H2 Database (Dev zero-dependency fallback).
- **Authentication**: JWT (JSON Web Tokens), Phone Number Login with OTP (Twilio & HTTP Gateway), Google Sign-In OAuth, Email/Password, Password Reset Token Flow, and Multi-Provider Account Linking.
- **React Frontend (`frontend`)**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Capacitor 6.
- **Flutter Frontend (`frontend/flutter`)**: Dart, Flutter 3.0+ cross-platform mobile and web client.

---

## Advanced Authentication & Security System

FoodConnect features a multi-method authentication system:

1. **Phone Number Login with OTP Verification**:
   - E.164 phone number format validation (`+919876543210`).
   - Secure 6-digit random OTP generation with BCrypt hashing (`phone_otp_tokens`). Plain-text OTPs are **never** stored.
   - **OTP Replay Protection**: Enforces single-use status (`isVerified = true`). OTP codes cannot be reused.
   - **Rate Limiting & Anti-Spam**: 60-second resend cooldown and 5 requests per 10-minute rate limit.
   - **Brute-Force Protection**: 5 max failed verification attempts before OTP lockout.
2. **Google Sign-In**:
   - Official Google Sign-In integration for Flutter Mobile, Flutter Web, and React Web.
   - Automatic user account creation and account linking when emails match.
3. **Email & Password Login**:
   - BCrypt password hashing via Spring Security.
   - Password reset via single-use 15-minute expiration tokens.
4. **Multi-Provider Account Linking**:
   - Link Phone OTP, Google OAuth, and Email/Password to a unified user profile.

---

## Getting Started Guide

### Prerequisites
- **Java Development Kit**: JDK 21 or JDK 25 installed.
- **Node.js & npm**: Node.js 18+ for React web development.
- **Flutter SDK**: Flutter 3.0+ for cross-platform mobile development.

---

### 1. Running the Backend Server (Spring Boot)

```powershell
# Navigate to backend directory
cd backend

# Run with local Maven Wrapper (Windows PowerShell / CMD)
.\mvnw.cmd spring-boot:run

# Or run with local Maven Wrapper (Linux / macOS / Bash)
./mvnw spring-boot:run
```

- **Zero-Dependency Startup**: The backend automatically initializes an in-memory H2 database (`jdbc:h2:mem:foodconnect`) when PostgreSQL is not configured.
- **Tomcat REST Server**: `http://localhost:8080`
- **Swagger / OpenAPI Interactive API Docs**: `http://localhost:8080/swagger-ui.html`
- **H2 Database Web Console**: `http://localhost:8080/h2-console`

#### Production PostgreSQL Configuration (`backend/src/main/resources/application.yml`)
```bash
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/foodconnect
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=yourpassword
```

---

### 2. Running the React Web Application (`frontend`)

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies and start Vite dev server
npm install
npm run dev
```

- **React Vite Web Server**: Starts on `http://localhost:8443` (automatically handles port fallback if 8443 is in use).
- **API Gateway Proxy**: Automatically forwards `/api/v1` requests to `http://localhost:8080`.

---

### 3. Running the Flutter Mobile App (`frontend/flutter`)

```powershell
# Navigate to Flutter app directory
cd frontend/flutter

# Fetch dependencies and launch app
flutter pub get
flutter run
```

---

## Automated Testing & Verification

Run the full backend automated test suite:

```powershell
cd backend
.\mvnw.cmd test               # On Windows
# or ./mvnw test              # On Linux / macOS
```

### Test Suite Execution Summary
- **Total Tests Run**: 15
- **Failures**: 0
- **Errors**: 0
- **Skipped**: 0
- **Status**: `BUILD SUCCESS`

Includes unit and security tests covering:
- OTP single-use replay prevention (`AuthSecurityTest`)
- SMS provider dispatch (`SmsService`)
- 60-second cooldown enforcement & rate limiting
- 5-attempt brute-force lockout
- User registration, login, Google Sign-In, and expired token rejection.

---

## 📄 License
Licensed under the Apache 2.0 License.
