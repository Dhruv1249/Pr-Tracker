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

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

/* =========================
   Inner App (inside provider)
========================= */

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [needsImport, setNeedsImport] = useState(false);

  const {
    setRepos,
    setActiveRepository,
    activeRepository,
    setUser,
    user,
    setRefreshRepos,
  } = useRepo();

  /* ---------- LOAD DATA ---------- */
  const loadData = useCallback(async () => {
    try {
      // 1. Current user
      const userRes = await axios.get(
        `${serverEndpoint}/api/db/users/me`,
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
        `${serverEndpoint}/api/repos`,
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
    }
  }, [setRepos, setActiveRepository, setUser]);

  /* ---------- INIT ---------- */
  useEffect(() => {
    setRefreshRepos(() => loadData);

    async function init() {
      await loadData();
      setLoading(false);
    }

    init();
  }, [loadData, setRefreshRepos]);

  /* ---------- LOADING ---------- */
  if (loading) return null;

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