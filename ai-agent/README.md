# PR Tracker — AI Agent Service

The **AI Agent Service** uses Mistral AI to perform intelligent analysis of pull request diffs. It provides automated code review, risk assessment, security vulnerability detection, and an interactive conversational agent.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)
- [AI Capabilities](#ai-capabilities)
- [Project Structure](#project-structure)
- [Docker](#docker)

---

## Overview

| Property | Value |
|----------|-------|
| **Port** | `5001` |
| **Role** | AI-powered PR analysis |
| **AI Model** | Mistral `devstral-2512` |
| **Accessed via** | `pr-tracker-service-router` (port 5003) |

---

## Prerequisites

- Node.js >= 18
- A valid [Mistral AI API key](https://console.mistral.ai/)

---

## Installation

```bash
cd pr-tracker-ai-agent
npm install
cp .env.example .env
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port the service listens on (default: `5001`) |
| `MISTRAL_API_KEY` | Your Mistral AI API key |
| `PROXY_URL` | API Gateway URL (for CORS origin) — e.g. `http://localhost:5003` |

---

## Running the Service

```bash
# Development (nodemon)
npm run dev
```

> This service uses ES Modules (`"type": "module"` in package.json).

---

## API Endpoints

All routes accept `POST` requests with a JSON body containing a `content` field (the PR unified diff).

### Code Review

```
POST /api/ai/review
```

**Request body:**
```json
{
  "content": "<unified diff string>"
}
```

**Response:**
```json
{
  "message": "Detailed code review feedback..."
}
```

---

### Risk Assessment

```
POST /api/ai/risk
```

**Request body:**
```json
{
  "content": "<unified diff string>"
}
```

**Response:**
```json
{
  "riskLevel": "low" | "medium" | "high",
  "reason": "Brief explanation of the risk assessment"
}
```

---

### Security Detection

```
POST /api/ai/security
```

**Request body:**
```json
{
  "content": "<unified diff string>"
}
```

**Response:**
```json
{
  "status": "clean" | "flagged",
  "flags": ["description of vulnerability 1", "..."]
}
```

---

### Conversational Agent

```
POST /api/ai/agent
```

An interactive endpoint for free-form questions about a PR or codebase context.

**Request body:**
```json
{
  "content": "<question or context>"
}
```

---

## AI Capabilities

| Capability | Endpoint | Description |
|-----------|----------|-------------|
| Code Review | `/api/ai/review` | Analyses code quality, bugs, and best practices |
| Risk Assessment | `/api/ai/risk` | Rates the PR as low / medium / high risk |
| Security Scan | `/api/ai/security` | Flags potential vulnerabilities in the diff |
| Agent Chat | `/api/ai/agent` | Free-form conversational assistant |

All analysis is performed by the `devstral-2512` model optimised for developer and code tasks.

---

## Project Structure

```
pr-tracker-ai-agent/
+-- index.js                    # Entry point (port 5001)
+-- package.json
+-- Dockerfile
+-- ai/
|   +-- mistral.js              # Mistral API client + prompt templates
+-- controllers/
|   +-- aiController.js         # Handles /api/ai/review
|   +-- agentController.js      # Handles /api/ai/agent
|   +-- riskController.js       # Handles /api/ai/risk
|   +-- securityController.js   # Handles /api/ai/security
+-- routes/
    +-- ai.route.js             # /api/ai/review, /api/ai/agent
    +-- risk.route.js           # /api/ai/risk
    +-- security.route.js       # /api/ai/security
```

---

## Docker

```bash
docker build -t pr-tracker-ai-agent .
docker run -p 5001:5001 --env-file .env pr-tracker-ai-agent
```
