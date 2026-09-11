# Amrit Chhaya Foundation Platform

A modern, high-performance web platform and REST API backend built for the **Amrit Chhaya Foundation**.

It powers Pooja Bookings, Yatra Tours, Donations, Goshala Cow Support, Blog/Gallery Content, and an Admin Management Dashboard.

---

## 🏗️ Project Architecture & Directory Structure

```text
amritchhaya/
├── backend/                       # Node.js, Express & MySQL REST API Service
│   ├── config/                    # DB connection pool & environment setup
│   ├── database/                  # MySQL schema (schema.sql) & auto-init (initDb.js)
│   ├── controllers/               # Express request handlers
│   ├── services/                  # Business logic & parameterized database queries
│   ├── middlewares/                # JWT Auth & centralized error handling
│   ├── routes/                    # Express modular route definitions
│   ├── utils/                     # API response formatters & JWT helpers
│   ├── server.js                  # Express server entry point
│   ├── api.md                     # Backend API contract documentation
│   ├── frontend_guide.md          # Guide for frontend developers
│   └── test_api.js                # Verification test suite
├── index.html                     # Main website homepage
├── pooja.html                     # Pooja listing page
├── pooja_details.html             # Single pooja details page
├── tours.html                     # Yatra tours page
├── donate.html                    # Donation page
├── goshala.html                   # Goshala cow support page
├── blogs.html                     # Blog posts page
├── gallery.html                   # Photo gallery page
├── contact.html                   # Contact & enquiry page
├── style.css                      # Global custom styling
└── frontend_guide.md              # Root frontend integration guide
```

---

## ⚡ Prerequisites

Before running the application, make sure you have installed:

- **Node.js**: `v18.x` or `v20.x` ([Download Node.js](https://nodejs.org/))
- **MySQL Server**: `v8.0+` ([Download MySQL](https://dev.mysql.com/downloads/installer/))
- **npm**: (Included with Node.js)

---

## 🚀 Quick Start Guide

### Step 1: Navigate to the Backend Directory

Open your terminal or command prompt and run:

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

Installed core packages:
- `express`: Fast, unopinionated web framework for Node.js.
- `mysql2`: MySQL driver supporting Connection Pooling and Promises (`async/await`).
- `jsonwebtoken`: Secure JWT token generation and verification.
- `bcryptjs`: Password hashing for admin accounts.
- `cors`: Cross-Origin Resource Sharing middleware.
- `dotenv`: Environment variable loader.
- `razorpay`: Payment gateway SDK.

### Step 3: Configure Environment Variables (`.env`)

Create or update the `.env` file inside the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MySQL Database Credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=amritchhaya_db

# Security & Secrets
JWT_ACCESS_SECRET=amritchhaya_jwt_access_secret_key_2026_super_secure
JWT_REFRESH_SECRET=amritchhaya_jwt_refresh_secret_key_2026_super_secure
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Razorpay Keys
RAZORPAY_KEY_ID=rzp_test_sample_key
RAZORPAY_KEY_SECRET=sample_secret_key
```

### Step 4: Initialize the Database

Run the database initialization script. This creates the `amritchhaya_db` database, generates all 21 SQL tables, loads seed data, and creates a default Super Admin account:

```bash
node database/initDb.js
```

**Default Admin Credentials:**
- **Email**: `admin@example.com`
- **Password**: `password`

### Step 5: Run Verification Tests

Ensure all services, database queries, JWT authentication, and Razorpay order flows are working:

```bash
node test_api.js
```

### Step 6: Start the Development Server

```bash
npm run dev
```

The API server will be available at:
`http://localhost:5000/api/v1`

---

## 🔑 Key API Routes Overview

Base URL: `http://localhost:5000/api/v1`

| Module | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | Public | Admin login & token issuance |
| **Auth** | `POST` | `/auth/refresh` | Public | Refresh expired access token |
| **Auth** | `POST` | `/auth/logout` | Authenticated | Revoke refresh token |
| **Poojas** | `GET` | `/poojas` | Public | Paginated list of poojas |
| **Poojas** | `GET` | `/poojas/:slug` | Public | Pooja details, variants & features |
| **Poojas** | `GET` | `/pooja-categories` | Public | List pooja categories |
| **Poojas** | `GET` | `/poojas/:id/slots?date=YYYY-MM-DD` | Public | Check slot availability |
| **Bookings**| `POST` | `/bookings` | Public | Create new booking (Server price calculation) |
| **Bookings**| `GET` | `/bookings/:bookingId` | Public | Retrieve booking by ID |
| **Payments**| `POST` | `/payments/create-order` | Public | Generate Razorpay order in paise |
| **Payments**| `POST` | `/payments/verify` | Public | Verify HMAC SHA256 payment signature |
| **Yatras** | `GET` | `/yatras` | Public | List yatra packages |
| **Yatras** | `POST` | `/yatra-bookings` | Public | Book a yatra package |
| **Donations**| `POST` | `/donations` | Public | Initiate donation |
| **Goshala** | `GET` | `/goshala/cows` | Public | List cows available for adoption |
| **Content** | `POST` | `/enquiries` | Public | Submit contact enquiry |
| **Admin** | `GET` | `/admin/dashboard` | Admin Only | Dashboard stats & revenue analytics |
| **Admin** | `GET` | `/admin/bookings` | Admin Only | Manage all bookings & status updates |

For complete integration snippets and React/Axios code, check [`frontend_guide.md`](file:///e:/GIT_PROJECT/amritchhaya/frontend_guide.md).

---

## 🛡️ Security & Best Practices Implemented

1. **Price Manipulation Protection**: Final booking prices are determined on the backend by querying `pooja_variants` table in MySQL, preventing client-side price modification.
2. **Cryptographic Payment Verification**: Payment signatures are validated using HMAC SHA256 before marking bookings as `CONFIRMED`.
3. **Parameterized SQL Queries**: All database interactions use `?` placeholders, eliminating SQL Injection vulnerabilities.
4. **JWT Authentication**: Short-lived access tokens (1 hour) and long-lived refresh tokens (7 days) with role-based authorization middleware (`SUPER_ADMIN`, `ADMIN`).

---

## 📝 License

Distributed under the ISC License. Built for **Amrit Chhaya Foundation**.
