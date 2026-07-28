# 🍲 FoodConnect - Location-Based Food Donation Platform (India)

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)
![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)

**FoodConnect** is a production-ready, location-based food donation platform designed for India to eliminate food waste by connecting food donors (restaurants, caterers, households) with NGOs, shelters, orphanages, volunteers, and recipients in real time.

---

## 🌟 Key Features

### 👤 Role-Based Portals
- **DONOR**: Post surplus food listings with quantity, prepared time, pickup deadline, veg/non-veg flags, and precise GPS location.
- **RECIPIENT (NGO / Shelter / Orphanage)**: Discover nearby food donations sorted by distance, request donations, and track approval status.
- **VOLUNTEER**: Claim approved donation deliveries, update delivery progress (`ASSIGNED` → `PICKED_UP` → `DELIVERED`), and build volunteer ratings.
- **ADMIN**: Platform dashboard metrics, user activation/deactivation, organization verification (e.g. Akshaya Patra, Robin Hood Army), and audit logs.

### 📍 Haversine Geolocation Search
Utilizes a native Haversine spatial algorithm to calculate real-time distance in kilometers between donor listings and user coordinates:
$$\text{distance} = 6371 \times \arccos\left(\sin(\phi_1)\sin(\phi_2) + \cos(\phi_1)\cos(\phi_2)\cos(\Delta\lambda)\right)$$

---

## 🛠️ Technology Stack

### Backend
- **Core**: Java 21, Spring Boot 3.3.2
- **Security**: Spring Security, JWT (JSON Web Tokens), BCrypt Password Hashing
- **Data & Persistence**: Spring Data JPA, Hibernate, PostgreSQL (Supabase / Local)
- **API Documentation**: Swagger OpenAPI 3.0 (`/swagger-ui.html`)
- **Utilities & Logging**: Lombok, SLF4J, Logback
- **Deployment**: Docker, Docker Compose, Render

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Modern UI with Tailwind CSS & Lucide Icons
- **Routing & State**: Interactive multi-role dashboard workflow

---

## 📂 Project Structure

```
FoodConnect/
├── backend/                  # Spring Boot 3 Java 21 REST API
│   ├── src/main/java/com/foodconnect/
│   │   ├── config/           # SecurityConfig, OpenApiConfig, DataInitializer
│   │   ├── controller/       # Auth, Donation, Request, Volunteer, Delivery, Admin Controllers
│   │   ├── dto/              # Auth, Donation, Delivery, Request DTOs & ApiResponse
│   │   ├── entity/           # User, Role, Donation, Organization, Volunteer, Delivery Entities
│   │   ├── enums/            # RoleName, DonationStatus, FoodCategory, VegNonVeg Enums
│   │   ├── repository/       # Spring Data JPA Repositories (with Haversine native queries)
│   │   ├── security/         # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal
│   │   ├── service/          # Business logic services & implementations
│   │   └── util/             # LocationUtils, DateUtils
│   ├── src/main/resources/
│   │   ├── application.yml   # Base application configuration
│   │   ├── db/schema.sql     # PostgreSQL database DDL
│   │   └── db/data.sql       # Seed data for Indian NGOs & Settings
│   ├── Dockerfile            # Multi-stage Docker containerization
│   ├── docker-compose.yml    # PostgreSQL + Spring Boot orchestration
│   └── pom.xml               # Maven dependencies
└── frontend/                 # React + TypeScript Web App
    ├── src/
    │   ├── components/       # Layout & Shared UI components
    │   └── screens/          # Donor, Recipient, Volunteer, Admin Dashboards & Nearby Map
    └── package.json
```

---

## 🔗 REST API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new user (DONOR, RECIPIENT, VOLUNTEER) |
| `POST` | `/api/v1/auth/login` | Public | Login and obtain Bearer JWT token |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetch current user profile |
| `POST` | `/api/v1/donations` | DONOR / ADMIN | Post a new food donation listing |
| `GET` | `/api/v1/donations/nearby` | Authenticated | Search nearby food listings within radius |
| `POST` | `/api/v1/requests/donations/{id}` | RECIPIENT | Request a specific food donation |
| `POST` | `/api/v1/requests/{id}/approve` | DONOR / ADMIN | Approve recipient food request |
| `POST` | `/api/v1/deliveries/claim/{id}` | VOLUNTEER | Volunteer claims delivery task |
| `PUT` | `/api/v1/deliveries/{id}/status` | VOLUNTEER | Update delivery state (`PICKED_UP` / `DELIVERED`) |
| `GET` | `/api/v1/admin/stats` | ADMIN | View platform metrics and stats |

---

## 🚀 Quick Start Guide

### Prerequisites
- JDK 21+ installed
- Node.js 18+ installed
- PostgreSQL 16 installed (or Supabase URL)
- Docker Desktop (optional)

### Running Backend Locally
```bash
cd backend
mvn spring-boot:run
```
> Swagger API documentation will be available at: `http://localhost:8080/swagger-ui.html`

### Running Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

### Running with Docker Compose
```bash
docker-compose up --build
```

---

## 🇮🇳 Seed Data (India Defaults)

On initial startup, `DataInitializer.java` & `data.sql` auto-seed the following default credentials:

- **Admin Email**: `admin@foodconnect.in`
- **Password**: `Admin@123`
- **Default Location**: Indiranagar, Bengaluru, Karnataka (`12.9716`, `77.5946`)
- **Seeded NGOs**: Akshaya Patra Foundation, Robin Hood Army India, Feeding India by Zomato, No Food Waste India

---

## 📄 License
This project is licensed under the Apache 2.0 License.
