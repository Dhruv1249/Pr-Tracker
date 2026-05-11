import { Route, Routes } from "react-router-dom";
import LandingPage from "./components/pages/LandingPage";
import AppLayout from "./components/layout/AppLayout";
import { Dashboard } from "./components/pages/Dashboard";
import { PullRequestsPage } from "./components/pages/PullRequests";
import { RepositoriesPage } from "./components/pages/Repository";
import PRDetails from "./components/pages/PRDetails";
import LoginPage from "./components/pages/Login";
import ImportReposPage from "./components/pages/ImportRepos";
import AuthCallback from "./components/pages/AuthCallback";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { timeAgo } from "./utils/timeAgo";
import { RepoProvider, useRepo } from "./context/RepoContext";
import { useLocation } from "react-router-dom";

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT || "";
const PUBLIC_ROUTES = ["/", "/login", "/auth/callback"];

/* =========================
   Inner App (inside provider)
========================= */

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [needsImport, setNeedsImport] = useState(false);
  const [bootError, setBootError] = useState(null);
  const location = useLocation();

  const {
    setRepos,
    setActiveRepository,
    activeRepository,
    setUser,
    user,
    setRefreshRepos,
  } = useRepo();

  const isPublicRoute = PUBLIC_ROUTES.some((path) => location.pathname === path);

  /* ---------- LOAD DATA ---------- */
  const loadData = useCallback(async () => {
    try {
      setBootError(null);

      // If serverEndpoint is missing, we use relative paths (default in production)
      const apiBase = serverEndpoint || "";

      // 1. Current user
      const userRes = await axios.get(
        `${apiBase}/api/db/users/me`,
        { withCredentials: true }
      );

      const userData = userRes.data?.data;
      setUser(userData);

      const importedIds = userData?.repositories || [];
      const noRepos = importedIds.length === 0;
      setNeedsImport(noRepos);

      if (noRepos) {
        setRepos([]);
        setActiveRepository(null);
        return;
      }

      // 2. GitHub repos
      const repoRes = await axios.get(
        `${apiBase}/api/repos`,
        { withCredentials: true }
      );

      const allGhRepos = repoRes.data || [];

      // 3. Filter imported
      const filtered = allGhRepos.filter((r) =>
        importedIds.includes(r.githubRepoId)
      );

      const mapped = filtered.map((r) => ({
        id: r.githubRepoId,
        name: r.name,
        owner: r.owner,
        fullName: r.fullName,
        prs: r.openPrs || 0,
        updated: timeAgo(r.updatedAt),
      }));

      setRepos(mapped);

      // Restore last selected repo
      const savedId = localStorage.getItem("activeRepoId");
      let toActivate = null;

      if (savedId) {
        toActivate = mapped.find(
          (r) => String(r.id) === String(savedId)
        );
      }

      if (!toActivate && mapped.length > 0) {
        toActivate = mapped[0];
      }

      setActiveRepository(toActivate || null);
    } catch (error) {
      console.error("Init failed", error);
      setNeedsImport(true);
      setRepos([]);
      setActiveRepository(null);
      setBootError(
        error?.response?.status === 401
          ? "Your session is not active. Please sign in again."
          : error?.message || "Failed to load your workspace."
      );
    }
  }, [setRepos, setActiveRepository, setUser]);

  /* ---------- INIT ---------- */
  useEffect(() => {
    setRefreshRepos(() => loadData);

    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    setLoading(true);

    async function init() {
      await loadData();
      setLoading(false);
    }

    init();
  }, [loadData, setRefreshRepos, isPublicRoute]);

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6">
        <div className="w-full max-w-sm rounded-2xl border border-divider bg-surface px-6 py-8 text-center shadow-lg">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-divider border-t-accent" />
          <p className="mt-4 text-sm font-medium text-primary">Loading PR Tracker</p>
          <p className="mt-1 text-xs text-secondary">Synchronizing your session and repository data.</p>
        </div>
      </div>
    );
  }

  if (bootError && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6">
        <div className="w-full max-w-md rounded-2xl border border-divider bg-surface p-6 text-center">
          <h1 className="text-lg font-semibold text-primary">Workspace unavailable</h1>
          <p className="mt-2 text-sm text-secondary">{bootError}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90"
            >
              Try again
            </button>
            <a
              href="/login"
              className="flex-1 rounded-md border border-divider px-4 py-2 text-sm text-secondary hover:bg-hover hover:text-primary"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- ROUTES ---------- */
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* App shell */}
      <Route element={<AppLayout user={user} />}>
        <Route
          path="/dashboard"
          element={
            <Dashboard user={user} needsImport={needsImport} />
          }
        />
        <Route path="/pull-requests" element={<PullRequestsPage />} />
        <Route path="/repos" element={<RepositoriesPage />} />
        <Route path="/pull-requests/:id" element={<PRDetails />} />
        <Route path="/import-repos" element={<ImportReposPage />} />
      </Route>
    </Routes>
  );
}

/* =========================
   Provider Wrapper
========================= */

function App() {
  return (
    <RepoProvider>
      <AppContent />
    </RepoProvider>
  );
}

export default App;