# PR TrackerCore Backend Service

The **Core Backend Service** is the business logic engine of the PR Tracker application. It interfaces with the GitHub API to manage repositories and pull requests, and orchestrates AI analysis, dashboard stats, webhook events, and CLI operations

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Docker](#docker)

---

## Overview

| Property | Value |
|----------|-------|
| **Port** | `5002` |
| **Role** | Business logic, GitHub API integration, PR management |
| **Accessed via** | `pr-tracker-service-router` (port 5003) |
| **Calls** | GitHub REST API, `pr-tracker-ai-agent` (port 5001), `pr-tracker-mongodb` (port 5004) |

---

## Architecture

```
API Gateway (port 5003)
    |
    v
Core Backend (port 5002)
    |
    +-- GitHub REST API  (repositories, pull requests, diffs)
    +-- AI Agent         (PR analysis, risk, security)
    +-- MongoDB Service  (persist synced data)
```

Each incoming request carries a JWT; the user's encrypted GitHub token is decrypted and used to authenticate GitHub API calls on behalf of the user.

---

## Prerequisites

- Node.js >= 18
- Running `pr-tracker-service-router` (port 5003)
- Running `pr-tracker-ai-agent` (port 5001)
- Running `pr-tracker-mongodb` (port 5004)

---

## Installation

```bash
cd pr-tracker-main-backend
npm install
cp .env.example .env
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the service listens on | `5002` |
| `PROXY_URL` | API Gateway URL (for allowed CORS origin) | `http://localhost:5003` |
| `AI_SERVICE_URL` | AI Agent base URL | `http://localhost:5001` |
| `DB_SERVICE_URL` | MongoDB Service base URL | `http://localhost:5004` |
| `AUTH_SERVICE_URL` | Auth Service base URL | `http://localhost:5005` |
| `JWT_SECRET` | Same secret used across all services | `supersecretkey` |
| `ENCRYPTION_KEY` | Same AES key used across all services | `abc123...` |

---

## Running the Service

```bash
# Development
npm run dev

# Production
npm start
```

---

## API Endpoints

### Repositories

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/repos` | List all GitHub repos for the authenticated user |
| `GET` | `/api/repos/tracked` | List repos the user is actively tracking |
| `POST` | `/api/repos/track` | Start tracking a repository |
| `DELETE` | `/api/repos/track/:repoId` | Stop tracking a repository |
| `GET` | `/api/repos/:repoId/prs` | List pull requests for a tracked repo |
| `POST` | `/api/repos/:repoId/sync` | Force-sync a repo's PR data from GitHub |
| `GET` | `/api/repos/:owner/:name` | Get details for a specific repository |

### Pull Requests

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/prs/:prId` | Get full details of a pull request |
| `GET` | `/api/prs/:prId/diff` | Get the unified diff for a PR |
| `GET` | `/api/prs/:prId/conflicts` | Check for merge conflicts |
| `POST` | `/api/prs/:prId/merge` | Merge a pull request |
| `POST` | `/api/prs/:prId/close` | Close a pull request |
| `POST` | `/api/prs/:prId/reopen` | Reopen a closed pull request |
| `POST` | `/api/prs/:prId/reviews` | Submit a review on a PR |
| `GET` | `/api/prs/:prId/reviews` | List all reviews for a PR |
| `POST` | `/api/prs/:prId/tags` | Add a tag/label to a PR |
| `DELETE` | `/api/prs/:prId/tags/:tag` | Remove a tag/label from a PR |
| `POST` | `/api/prs/:prId/analyze` | Trigger AI analysis on a PR diff |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard/stats` | Aggregated stats (open PRs, merged, etc.) |
| `GET` | `/api/dashboard/recent-prs` | Most recently updated pull requests |

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/webhooks/github` | Receives GitHub webhook push events |

### CLI

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/cli/login` | Authenticate via CLI token |
| `GET` | `/api/cli/status` | Check CLI auth status |
| `POST` | `/api/cli/pr/:prId/merge` | Merge a PR from CLI |
| `POST` | `/api/cli/repos/track` | Track a repo from CLI |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Service health check |

---

## Project Structure

```
pr-tracker-main-backend/
+-- src/
|   +-- index.js                      # Entry point, Express setup (port 5002)
|   +-- controllers/
|   |   +-- repos.controller.js       # Repository operations
|   |   +-- prs.controller.js         # PR lifecycle + reviews + tags
|   |   +-- dashboard.controller.js   # Stats and recent PRs
|   |   +-- webhooks.controller.js    # GitHub webhook handler
|   |   +-- cli.controller.js         # CLI integration
|   +-- routes/
|   |   +-- repos.routes.js
|   |   +-- prs.routes.js
|   |   +-- dashboard.routes.js
|   |   +-- webhooks.routes.js
|   |   +-- cli.routes.js
|   +-- services/
|   |   +-- github.js                 # GitHub API wrapper
|   |   +-- ai.js                     # Calls AI agent service
|   |   +-- db.js                     # Calls MongoDB service
|   |   +-- decrypt.js                # Decrypts user GitHub token
|   |   +-- userToken.js              # Extracts user from JWT
|   +-- middleware/
|       +-- errorHandler.js
+-- package.json
+-- Dockerfile
```

---

## Docker

```bash
docker build -t pr-tracker-main-backend .
docker run -p 5002:5002 --env-file .env pr-tracker-main-backend
```
