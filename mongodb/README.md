# PR Tracker — MongoDB Data Service

The **MongoDB Data Service** is the persistence layer of the PR Tracker microservices architecture. It exposes a RESTful API for CRUD operations on all core data entities: users, repositories, pull requests, and reviews.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Project Structure](#project-structure)
- [Docker](#docker)

---

## Overview

| Property | Value |
|----------|-------|
| **Port** | `5004` |
| **Role** | Database CRUD operations |
| **Database** | MongoDB (Mongoose ODM) |
| **Accessed via** | `pr-tracker-service-router` (port 5003) |

This service is intentionally thin — it contains no business logic. All requests arrive via the API Gateway, which handles authentication.

---

## Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

---

## Installation

```bash
cd pr-tracker-mongodb
npm install
cp .env.example .env
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the service listens on | `5004` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/prtracker` |
| `NODE_ENV` | Environment | `development` |

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

All routes are prefixed with `/api`.

### Users — `/api/users`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/users` | Create a new user |
| `GET` | `/api/users` | Get all users |
| `GET` | `/api/users/:id` | Get user by MongoDB ObjectId |
| `GET` | `/api/users/github/:githubId` | Get user by GitHub numeric ID |
| `PUT` | `/api/users/github/:githubId` | Update user (e.g. refresh token) |
| `DELETE` | `/api/users/github/:githubId` | Delete user |

### Repositories — `/api/repositories`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/repositories` | Create a repository record |
| `GET` | `/api/repositories` | Get all repositories |
| `GET` | `/api/repositories/:id` | Get by MongoDB ObjectId |
| `GET` | `/api/repositories/github/:githubId` | Get by GitHub repo ID |
| `GET` | `/api/repositories/owner/:owner` | Get all repos for an owner |
| `GET` | `/api/repositories/fullname/:fullName` | Get by `owner/repo` full name |
| `PUT` | `/api/repositories/github/:githubId` | Update repository |
| `DELETE` | `/api/repositories/github/:githubId` | Delete repository |

### Pull Requests — `/api/pullrequests`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/pullrequests` | Create a pull request record |
| `GET` | `/api/pullrequests` | Get all pull requests |
| `GET` | `/api/pullrequests/:id` | Get by MongoDB ObjectId |
| `GET` | `/api/pullrequests/github/:githubId` | Get by GitHub PR ID |
| `GET` | `/api/pullrequests/repository/:repositoryId` | Get PRs for a repository |
| `GET` | `/api/pullrequests/repo-github/:repoGithubId` | Get PRs by repo GitHub ID |
| `GET` | `/api/pullrequests/state/:state` | Get PRs by state (`open`/`closed`/`merged`) |
| `GET` | `/api/pullrequests/author/:author` | Get PRs by author username |
| `PUT` | `/api/pullrequests/github/:githubId` | Update pull request |
| `PUT` | `/api/pullrequests/github/:githubId/merge` | Mark PR as merged |
| `PUT` | `/api/pullrequests/github/:githubId/close` | Mark PR as closed |
| `PUT` | `/api/pullrequests/github/:githubId/reopen` | Reopen PR |
| `DELETE` | `/api/pullrequests/github/:githubId` | Delete pull request |

### Reviews — `/api/reviews`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/reviews` | Create a review |
| `GET` | `/api/reviews` | Get all reviews |
| `GET` | `/api/reviews/:id` | Get by MongoDB ObjectId |
| `GET` | `/api/reviews/github/:githubId` | Get review by GitHub ID |
| `GET` | `/api/reviews/pullrequest/:pullRequestId` | Get reviews for a PR |
| `GET` | `/api/reviews/user/:user` | Get reviews by reviewer |
| `GET` | `/api/reviews/state/:state` | Get reviews by state |
| `PUT` | `/api/reviews/github/:githubId` | Update review |
| `DELETE` | `/api/reviews/github/:githubId` | Delete review |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |

---

## Data Models

### User
```
githubId       Number  (unique)
username       String
email          String
avatarUrl      String
accessTokenEncrypted  String
createdAt      Date
updatedAt      Date
```

### Repository
```
githubId       Number  (unique)
fullName       String  (e.g. "owner/repo")
owner          String
name           String
description    String
private        Boolean
defaultBranch  String
createdAt / updatedAt  Date
```

### PullRequest
```
githubId       Number  (unique)
repositoryId   ObjectId (ref: Repository)
title          String
body           String
state          String  (open | closed | merged)
author         String
sourceBranch   String
targetBranch   String
tags           [String]
createdAt / updatedAt / mergedAt / closedAt  Date
```

### Review
```
githubId       Number  (unique)
pullRequestId  ObjectId (ref: PullRequest)
user           String
state          String  (APPROVED | CHANGES_REQUESTED | COMMENTED | DISMISSED)
body           String
submittedAt    Date
```

---

## Project Structure

```
pr-tracker-mongodb/
+-- src/
|   +-- index.js                         # Entry point (port 5004)
|   +-- config/
|   |   +-- db.js                        # Mongoose connection
|   +-- models/
|   |   +-- index.js                     # Exports all models
|   |   +-- User.js
|   |   +-- Repository.js
|   |   +-- PullRequest.js
|   |   +-- Review.js
|   +-- controllers/
|   |   +-- userController.js
|   |   +-- repositoryController.js
|   |   +-- pullRequestController.js
|   |   +-- reviewController.js
|   +-- routes/
|   |   +-- userRoutes.js
|   |   +-- repositoryRoutes.js
|   |   +-- pullRequestRoutes.js
|   |   +-- reviewRoutes.js
|   +-- services/
|   |   +-- index.js
|   |   +-- pullRequestService.js
|   |   +-- repositoryService.js
|   |   +-- reviewService.js
|   |   +-- userService.js
|   +-- middleware/
|       +-- errorHandler.js
+-- package.json
+-- Dockerfile
```

---

## Docker

```bash
docker build -t pr-tracker-mongodb .
docker run -p 5004:5004 --env-file .env pr-tracker-mongodb
```
