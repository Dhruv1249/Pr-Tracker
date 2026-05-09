import { useState, useEffect } from "react";
import axios from "axios";
import { Github, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRepo } from "../../context/RepoContext";

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

export default function ImportReposPage() {
  const navigate = useNavigate();
  const { refreshRepos } = useRepo();

  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- FETCH GITHUB REPOS ---------- */
  const getRepos = async () => {
    try {
      setError(null);
      const res = await axios.get(
        `${serverEndpoint}/api/repos`,
        { withCredentials: true }
      );

      setRepos(res.data || []);
    } catch (error) {
      console.error("Fetch repos failed", error);
      setError("Unable to load your GitHub repositories right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRepos();
  }, []);

  /* ---------- SELECTION ---------- */
  const toggle = (githubRepoId) => {
    setSelected((prev) =>
      prev.includes(githubRepoId)
        ? prev.filter((x) => x !== githubRepoId)
        : [...prev, githubRepoId]
    );
  };

  const toggleAll = () => {
    const visibleRepoIds = filteredRepos.map((repo) => repo.githubRepoId);
    if (selected.length === visibleRepoIds.length) {
      setSelected([]);
    } else {
      setSelected(visibleRepoIds);
    }
  };

  const filteredRepos = repos.filter((repo) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return [repo.name, repo.fullName, repo.owner]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  });

  /* ---------- IMPORT ---------- */
  const handleImport = async () => {
    try {
      setError(null);
      const toImport = selected.map(id => {
        const r = repos.find(x => x.githubRepoId === id);
        return { owner: r.owner, name: r.name };
      });

      await axios.post(
        `${serverEndpoint}/api/repos/import`,
        { repos: toImport },
        { withCredentials: true }
      );

      // Re-fetch all app data so the dashboard shows imported repos immediately
      await refreshRepos();
      navigate("/dashboard");
    } catch (err) {
      console.error("Import failed", err);
      setError("Import failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <div className="rounded-2xl border border-divider bg-surface px-6 py-8 text-sm text-secondary">
          Loading repositories…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-xl space-y-6">

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-primary font-semibold">
            <Github className="h-5 w-5" />
            Connected repositories
          </div>
          <p className="text-sm text-secondary">
            Select repositories to import into PR Tracker
          </p>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-divider bg-surface p-5 space-y-4">

          {/* Search */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-md border border-divider bg-bg px-3 py-2 focus-within:border-accent/50 transition-colors">
              <Search className="h-4 w-4 text-secondary shrink-0" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search repositories by name or owner…"
                className="w-full bg-transparent text-sm text-primary placeholder:text-secondary outline-none"
              />
            </div>
            <p className="text-xs text-secondary">
              Filter the GitHub repos you can import into PR Tracker.
            </p>
          </div>

          {/* Select controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleAll}
              className="text-xs text-secondary hover:text-primary"
            >
              {selected.length === filteredRepos.length
                ? "Deselect all"
                : "Select all"}
            </button>

            <div className="text-xs text-secondary">
              {selected.length} selected
            </div>
          </div>

          {/* Repo list */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredRepos.map((repo) => (
              <RepoRow
                key={repo.githubRepoId}
                repo={repo}
                checked={selected.includes(repo.githubRepoId)}
                onToggle={() => toggle(repo.githubRepoId)}
              />
            ))}
            {!filteredRepos.length && (
              <div className="py-8 text-center text-sm text-secondary">
                No repositories match your search.
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleImport}
              disabled={!selected.length}
              className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-40"
            >
              Import selected
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 rounded-md border border-divider px-4 py-2 text-sm text-secondary hover:bg-hover"
            >
              Skip
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------- ROW ---------- */

function RepoRow({ repo, checked, onToggle }) {
  return (
    <label className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-hover cursor-pointer">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="accent-white"
        />

        <span className="text-sm text-primary truncate max-w-[220px]">
          {repo.name}
        </span>

        {repo.private && (
          <span className="text-xs text-secondary">private</span>
        )}
      </div>
    </label>
  );
}