# PR Tracker — API Gateway (Service Router)

The **API Gateway** is the single entry point for all client requests. It validates JWT authentication and proxies incoming traffic to the correct downstream microservice. No business logic lives here — the gateway exists purely to unify the service surface, enforce auth, and route requests.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Service](#running-the-service)
- [Routing Table](#routing-table)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Docker](#docker)

---

## Overview

| Property | Value |
|----------|-------|
| **Port** | `5003` |
| **Role** | API Gateway / reverse proxy |
| **Auth** | JWT validation (httpOnly cookie) |
| **Proxies to** | Auth (5005), Core (5002), AI (5001), MongoDB (5004) |

---

## Architecture

```
Browser / CLI
      |
      v
API Gateway  :5003
      |
      +-- /api/auth/*         --> Auth Service        :5005
      +-- /api/users/*        --> Auth Service        :5005
      |
      +-- /api/repos/*        --> Core Backend        :5002
      +-- /api/prs/*          --> Core Backend        :5002
      +-- /api/dashboard/*    --> Core Backend        :5002
      +-- /api/webhooks/*     --> Core Backend        :5002
      +-- /api/cli/*          --> Core Backend        :5002
      |
      +-- /api/ai/*           --> AI Agent            :5001
      |
      +-- /api/repositories/* --> MongoDB Service     :5004
      +-- /api/pullrequests/* --> MongoDB Service     :5004
      +-- /api/reviews/*      --> MongoDB Service     :5004
      +-- /api/db/users/*     --> MongoDB Service     :5004
```

---

## Prerequisites

- Node.js >= 18
- All downstream services must be running (or Docker Compose is used)

---

## Installation

```bash
cd pr-tracker-service-router
npm install
cp .env.example .env
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the gateway listens on | `5003` |
| `CLIENT_URL` | Allowed CORS origin (frontend) | `http://localhost:5173` |
| `AUTH_SERVICE_URL` | Auth Service base URL | `http://localhost:5005` |
| `CORE_SERVICE_URL` | Core Backend base URL | `http://localhost:5002` |
| `AI_SERVICE_URL` | AI Agent base URL | `http://localhost:5001` |
| `DB_SERVICE_URL` | MongoDB Service base URL | `http://localhost:5004` |
| `JWT_SECRET` | Secret for verifying JWT tokens | `supersecretkey` |

---

## Running the Service

```bash
# Development
npm run dev

# Production
npm start
```

---

## Routing Table

| Path Prefix | Destination Service | Port |
|-------------|---------------------|------|
| `/api/auth/*` | Auth Service | 5005 |
| `/api/users/*` | Auth Service | 5005 |
| `/api/repos/*` | Core Backend | 5002 |
| `/api/prs/*` | Core Backend | 5002 |
| `/api/dashboard/*` | Core Backend | 5002 |
| `/api/webhooks/*` | Core Backend | 5002 |
| `/api/cli/*` | Core Backend | 5002 |
| `/api/ai/*` | AI Agent | 5001 |
| `/api/repositories/*` | MongoDB Service | 5004 |
| `/api/pullrequests/*` | MongoDB Service | 5004 |
| `/api/reviews/*` | MongoDB Service | 5004 |
| `/api/db/users/*` | MongoDB Service | 5004 |
| `/api/health` | Gateway itself | — |

---

## Authentication

The gateway applies a JWT middleware (`src/middleware/auth.js`) to every request **except** auth routes (`/api/auth/*`). It reads the token from the `token` httpOnly cookie set during login.

- Valid JWT: the request is forwarded with the original headers intact.
- Missing/invalid JWT: `401 Unauthorized` is returned immediately without hitting any downstream service.

---

## Project Structure

```
pr-tracker-service-router/
+-- src/
|   +-- index.js                 # Entry point (port 5003)
|   +-- middleware/
|   |   +-- auth.js              # JWT validation middleware
|   +-- routes/
|       +-- auth.routes.js       # Proxy /api/auth and /api/users -> Auth Service
|       +-- core.routes.js       # Proxy repos/prs/dashboard/webhooks/cli -> Core
|       +-- ai.routes.js         # Proxy /api/ai -> AI Agent
|       +-- db.routes.js         # Proxy repositories/pullrequests/reviews -> MongoDB
|       +-- health.routes.js     # /api/health endpoint
+-- package.json
+-- Dockerfile
```

---

## Docker

```bash
docker build -t pr-tracker-service-router .
docker run -p 5003:5003 --env-file .env pr-tracker-service-router
```
