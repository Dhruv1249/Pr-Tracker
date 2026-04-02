# PR Tracker — Auth Service

The **Auth Service** handles GitHub OAuth authentication for the PR Tracker application. It is the identity layer of the microservices architecture, responsible for issuing JWT tokens and persisting user profiles to the database.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)
- [How Authentication Works](#how-authentication-works)
- [Project Structure](#project-structure)
- [Docker](#docker)

---

## Overview

| Property | Value |
|----------|-------|
| **Port** | `5005` |
| **Role** | GitHub OAuth + JWT issuance |
| **Database** | MongoDB (via `pr-tracker-mongodb` service) |
| **Communicates with** | `pr-tracker-service-router` (gateway) |

---

## Architecture

```
Browser
  
   GET /api/auth/github            Redirect to GitHub OAuth
  
   GET /api/auth/github/callback   Exchange code for token
                                       
                                        Encrypt GitHub access token
                                        Upsert user via gateway (POST /api/db/users)
                                        Issue JWT in httpOnly cookie
                                        Redirect to /dashboard
```

All database calls go through the **API Gateway** (`pr-tracker-service-router`) at `PROXY_URL`, which forwards them to the **MongoDB service**.

---

## Prerequisites

- Node.js >= 18
- A running instance of `pr-tracker-service-router` (port 5003)
- A running instance of `pr-tracker-mongodb` (port 5004)
- A GitHub OAuth App (Client ID + Client Secret)

---

## Installation

```bash
cd pr-tracker-backend
npm install
```

Copy the example environment file and fill in the values:

```bash
cp .env.example .env
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the service listens on | `5005` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `Iv1.abc123...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `secret...` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/prtracker` |
| `JWT_SECRET` | Secret used to sign JWT tokens | `supersecretkey` |
| `ENCRYPTION_KEY` | 32-byte hex key for AES token encryption | `abc123...` |
| `CLIENT_URL` | Frontend URL (for CORS + redirect) | `http://localhost:5173` |
| `PROXY_URL` | API Gateway URL | `http://localhost:5003` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |

---

## Running the Service

```bash
# Development (auto-restart with nodemon)
npm start

# Production
node server.js
```

---

## API Endpoints

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/github` | Redirects the user to GitHub OAuth consent page |
| `GET` | `/api/auth/github/callback` | GitHub redirects here; issues JWT cookie and redirects to dashboard |

### Repositories (legacy direct routes)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/repos` | Returns GitHub repositories for the authenticated user |

---

## How Authentication Works

1. The frontend navigates the user to `GET /api/auth/github`.
2. The service redirects to GitHub with the configured `GITHUB_CLIENT_ID` and `scope=user repo`.
3. After user consent, GitHub calls `GET /api/auth/github/callback?code=<code>`.
4. The service exchanges the code for a **GitHub access token**.
5. The GitHub user profile is fetched and the access token is **AES-encrypted** before storage.
6. The user is **upserted** in MongoDB via the API Gateway.
7. A **JWT** is issued and stored in an `httpOnly` cookie (7-day expiry).
8. The browser is redirected to the frontend `/dashboard`.

---

## Project Structure

```
pr-tracker-backend/
 server.js                   # Entry point (starts on PORT 5005)
 package.json
 Dockerfile
 src/
     app.js                  # Express app setup, CORS, routes
     config/
        db.js               # Mongoose connection
        githubOAuth.js      # GitHub OAuth credentials
     controllers/
        authController.js   # githubLogin, githubCallback
        repoController.js   # GitHub repo fetching
     model/
        user.js             # Mongoose User schema
     routes/
        authRoutes.js       # /api/auth/github, /api/auth/github/callback
        repoRoutes.js       # /api/repos
     services/
         encryptionService.js # AES encrypt/decrypt
         githubService.js     # GitHub API calls
         repoService.js       # Fetch user repos
         tokenService.js      # JWT sign/verify
```

---

## Docker

```bash
docker build -t pr-tracker-backend .
docker run -p 5005:5005 --env-file .env pr-tracker-backend
```
