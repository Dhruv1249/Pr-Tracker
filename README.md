# PR Tracker

An AI-powered Pull Request tracking and analysis system built with a robust **MERN Microservices Architecture**. This platform helps developers manage, sync, and analyze GitHub Pull Requests using autonomous AI agents.

---
<!-- test push -->
## Architecture Overview

The system is composed of 6 specialized microservices that communicate through a central gateway.

| Service | Directory | Role | Tech Stack |
| :--- | :--- | :--- | :--- |
| **Service Router** | `/service-router` | **API Gateway & Security Orchestrator**. Central entry point, handles Auth verification (JWT), CSRF protection, and Rate Limiting. | Express, `http-proxy-middleware` |
| **Auth Service** | `/auth` | **Identity Provider**. Manages GitHub OAuth 2.0 flow, user profile synchronization, and sensitive token encryption (AES-256-GCM). | Express, Passport.js, Crypto |
| **Main Backend** | `/backend` | **Business Logic & GitHub Integration**. Interacts with GitHub API, manages repo tracking, and orchestrates PR analysis. | Express, GitHub REST API |
| **AI Agent** | `/ai-agent` | **Autonomous Reasoning Agent**. Leverages Mistral AI to perform deep code reviews and execute repository actions via function calling. | Mistral AI, Express |
| **Database Service** | `/mongodb` | **Persistence Layer**. Dedicated service for MongoDB interactions, ensuring data integrity and centralized CRUD operations. | Express, Mongoose |
| **Frontend** | `/frontend` | **Interactive UI**. A premium React-based dashboard for managing repositories and viewing AI-driven PR insights. | React, Vite, Tailwind CSS |

---

## Key Features

- **Secure Authentication**: GitHub OAuth 2.0 with HttpOnly JWT cookies and state-based CSRF protection.
- **AI-Powered Reviews**: Deep code analysis using Mistral AI (`devstral-2512`), providing summary, bug detection, and performance suggestions.
- **Agentic Workflows**: An AI agent capable of "tool-using" to merge, close, or sync PRs directly from the chat interface.
- **Microservices Orchestration**: Scalable architecture with a dedicated API Gateway managing identity propagation across services.
- **Data Security**: Sensitive GitHub Personal Access Tokens (PATs) are encrypted using AES-256-GCM before storage.
- **Real-time Sync**: Webhook integration for tracking PR updates and manual sync options for full repository state.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, React Router 7, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **AI**: Mistral AI (Agentic loops & Function calling).
- **Security**: JWT, AES-256-GCM, CSRF Protection, Helmet, Rate Limiting.
- **DevOps**: Docker, Docker Compose, Nginx.

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- MongoDB (Local or Atlas)
- GitHub OAuth App Credentials
- Mistral AI API Key

### Quick Start (Docker)

The easiest way to run the entire stack is using Docker Compose:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dhruv1249/Pr-Tracker.git
   cd Pr-Tracker
   ```

2. **Setup Environment Variables:**
   Each service has its own `.env` file. You must configure them based on the `.env.example` (if available) or service requirements.
   *   `CLIENT_URL`: Your frontend URL.
   *   `GATEWAY_URL`: URL of the service-router.
   *   `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: From your GitHub OAuth App.
   *   `MISTRAL_API_KEY`: Your Mistral AI key.
   *   `JWT_SECRET`: Random string for signing tokens.
   *   `ENCRYPTION_SECRET`: 32-byte key for AES encryption.

3. **Launch the stack:**
   ```bash
   docker-compose up --build
   ```

The application will be available at `http://localhost:5173`.

---

## Service Deep-Dive

For a detailed architectural map, including static code flow and internal API documentation, refer to [map.txt](./map.txt).

- **Gateway Flow**: `Browser` -> `Service Router` (Auth Check) -> `Target Microservice`.
- **Identity Propagation**: The Gateway injects `x-user-id` and `x-user-github-id` headers into downstream requests after verifying the session cookie.
- **Internal Security**: Services use a shared `INTERNAL_SECRET` to communicate securely without user sessions.

---

## Security Implementation

- **CSRF Protection**: Custom header check (`x-pr-tracker-csrf`) for all state-changing requests.
- **Credential Safety**: The `auth` service is the only service with access to the encryption key, providing a strict separation of concerns.
- **Rate Limiting**: Global rate limiting at the Gateway to prevent DDoS and API abuse.
- **Header Sanitization**: Automatic removal of internal identity headers from incoming external requests to prevent spoofing.

---

## License

This project is licensed under the MIT License.
