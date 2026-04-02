# PR Tracker — Client

A React-based frontend for tracking GitHub pull requests across your repositories. View PR status, manage reviews, get AI-powered code analysis, and stay on top of your team's workflow — all in one place.

---

## Tech Stack

| Library | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [Vite 7](https://vitejs.dev/) | Build tool & dev server |
| [React Router v7](https://reactrouter.com/) | Client-side routing |
| [Axios](https://axios-http.com/) | API requests |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Lucide React](https://lucide.dev/) | Icon library |
| [react-markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |

---

## Features

- **GitHub OAuth Login** — Authenticate with your GitHub account
- **Repository Import** — Select repositories to track; PRs are synced to the database immediately on import
- **Pull Requests List** — Paginated table/kanban view with search, filter by state (Open / Closed / Merged / Draft), and sort controls
- **Background Polling** — PRs auto-refresh every hour silently in the background; manual Refresh button available
- **PR Details** — Full detail view with commits, changed files, inline diff, comments, and reviewer info
- **AI Code Review** — On-demand AI analysis of PR diffs with structured insights (summary, issues, suggestions)
- **PR Insights** — Analytics panel per PR
- **Dashboard** — Overview of tracked repositories and activity
- **Repositories Page** — View and manage all imported repositories

---

## Project Structure

```
src/
├── App.jsx                  # Root component, auth guard, global data loading
├── context/
│   └── RepoContext.jsx      # Global state: active repo, user, repo list
├── components/
│   ├── pages/               # Top-level page components
│   │   ├── Dashboard.jsx
│   │   ├── PullRequests.jsx  # PR list with pagination & hourly polling
│   │   ├── PRDetails.jsx     # Full PR detail view
│   │   ├── Repository.jsx
│   │   ├── ImportRepos.jsx
│   │   ├── Login.jsx
│   │   └── LandingPage.jsx
│   ├── features/
│   │   ├── PRs/             # PR list, controls, table, kanban, insights
│   │   ├── dashboard/       # Dashboard stats components
│   │   └── repos/           # ImportRepoModal
│   ├── layout/              # AppLayout, Navbar, Sidebar
│   └── ui/                  # Shared UI primitives
└── utils/
    └── timeAgo.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- The backend gateway (`pr-tracker-service-router`) running on `http://localhost:5000`

### Installation

```bash
cd pr-tracker-client
npm install
```

### Environment Variables

Create a `.env` file in `pr-tracker-client/`:

```env
VITE_SERVER_ENDPOINT=http://localhost:5000
```

> This should point to your **gateway** (service-router), not directly to any individual backend service.

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

---

## Authentication Flow

1. User clicks **Login with GitHub** → redirected to GitHub OAuth
2. GitHub redirects back to the backend auth service callback
3. The gateway sets an `httpOnly` JWT cookie and redirects to `/dashboard`
4. All subsequent API calls are authenticated via this cookie

---

## PR Sync Behaviour

| Trigger | What happens |
|---|---|
| **Import repo** | Calls `POST /api/repos/track` → saves Repository + all PRs to MongoDB |
| **Page visit / repo switch** | Fetches latest PRs from GitHub; saves/updates them to DB in background |
| **Refresh button** | Same as above, on-demand |
| **Hourly polling** | Silent background re-fetch every 60 minutes while the PR list is open |