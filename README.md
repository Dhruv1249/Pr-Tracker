# PR Tracker

A microservices-based MERN stack application for tracking Pull Requests, featuring an AI agent, service routing, and GitHub authentication.

## 🏗️ Architecture

This repository adopts a microservices architecture, composed of the following modules (managed as Git submodules):

| Service                                          | Description                                               | Tech Stack                              |
| ------------------------------------------------ | --------------------------------------------------------- | --------------------------------------- |
| **Client** (`pr-tracker-client`)                 | Frontend application interface                            | React, Vite, Tailwind CSS, React Router |
| **Service Router** (`pr-tracker-service-router`) | API Gateway bridging the client and backend services      | Express.js, http-proxy-middleware       |
| **Main Backend** (`pr-tracker-main-backend`)     | Core business logic and primary API endpoints             | Express.js, JWT                         |
| **Auth Service** (`pr-tracker-auth`)             | Authentication service handling user login (GitHub OAuth) | Express.js, Passport.js, MongoDB        |
| **Database Service** (`pr-tracker-mongodb`)      | Dedicated service interfacing with the MongoDB database   | Express.js, Mongoose, Joi               |
| **AI Agent** (`pr-tracker-ai-agent`)             | Intelligent service leveraging Mistral AI for PR insights | Express.js, @mistralai/mistralai        |

_Note: There is also a `pr-tracker-backend` directory, which may serve as a legacy or alternative monolithic backend._

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (local or Atlas)
- Git (for managing submodules)

### Installation

1. **Clone the repository along with its submodules:**

   ```bash
   git clone --recurse-submodules <this-repo-url>
   cd mern_project
   ```

   _If you've already cloned without submodules, fetch them using:_

   ```bash
   git submodule update --init --recursive
   ```

2. **Install dependencies for each service:**
   Navigate into each microservice directory and install the necessary npm packages:

   ```bash
   for dir in pr-tracker-*/; do (cd "$dir" && npm install); done
   ```

3. **Environment Setup:**
   Ensure you create `.env` files in each respective backend and service directory, specifying necessary variables like database URIs, Mistral AI keys, and GitHub OAuth credentials.

### Running the Application

A convenience script `start.sh` is provided in the root directory to spin up all active services continuously.

```bash
chmod +x start.sh
./start.sh
```

This script will simultaneously boot up the MongoDB data service, Auth service, Main Backend, AI Agent, Service Router, and finally the Client frontend.
To gracefully spin down all local services, terminate the script using `Ctrl+C`.

## 🛠️ Tech Stack Overview

- **Frontend**: React 19, Vite, Tailwind CSS 4, React Router 7.
- **Backend Engine**: Node.js & Express.js.
- **Database & Modeling**: MongoDB & Mongoose.
- **Authentication**: Passport.js (GitHub Strategy) & JSON Web Tokens (JWT).
- **AI Integration**: Mistral AI API.
- **Gateway/Proxy**: HTTP Proxy Middleware.
- **Security & Utilities**: Helmet, CORS, Cookie Parser, Morgan.
