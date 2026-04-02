import { useEffect, useState } from "react";
import axios from "axios";
import { StatsGrid } from "../features/dashboard/components/StatsGrid";
import PROverview from "../features/dashboard/components/PROverview";
import RecentPRs from "../features/dashboard/components/RecentPRs";
import ImportReposPage from "./ImportRepos";
import { useRepo } from "../../context/RepoContext";

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

function deriveStatus(pr) {
  if (pr.merged_at) return "Merged";
  if (pr.state === "closed") return "Closed";
  if (pr.draft) return "Draft";
  return "Open";
}

const STATUS_CONFIG = [
  { key: "Open", color: "bg-green-500", text: "text-green-400", bg: "bg-green-500/10" },
  { key: "Merged", color: "bg-purple-500", text: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "Draft", color: "bg-zinc-500", text: "text-zinc-400", bg: "bg-zinc-500/10" },
  { key: "Closed", color: "bg-red-500", text: "text-red-400", bg: "bg-red-500/10" },
];

export function Dashboard({ user, needsImport, loading: appLoading }) {
  const { repos, activeRepository } = useRepo();
  const [prs, setPrs] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!activeRepository?.owner || !activeRepository?.name) return;
    setFetching(true);
    axios
      .get(
        `${serverEndpoint}/api/repos/${activeRepository.owner}/${activeRepository.name}/pulls?state=all&per_page=100`,
        { withCredentials: true }
      )
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setPrs(
          list
            .map((pr) => ({ ...pr, _repoFullName: activeRepository.fullName, _repoName: activeRepository.name }))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        );
      })
      .catch(() => setPrs([]))
      .finally(() => setFetching(false));
  }, [activeRepository]);

  const now = Date.now();

  const stats = {
    openPRs: prs.filter((p) => p.state === "open" && !p.draft).length,
    draftPRs: prs.filter((p) => p.draft).length,
    repositories: repos.length,
    activeToday: prs.filter((p) => now - new Date(p.updated_at).getTime() < 86400000).length,
  };

  // Status breakdown
  const total = prs.length;
  const counts = { Open: 0, Draft: 0, Merged: 0, Closed: 0 };
  prs.forEach((pr) => { const s = deriveStatus(pr); counts[s] = (counts[s] || 0) + 1; });

  // Avg age of open PRs
  const openPrs = prs.filter((p) => deriveStatus(p) === "Open" || deriveStatus(p) === "Draft");
  const avgAgeDays = openPrs.length
    ? Math.round(openPrs.reduce((s, p) => s + (now - new Date(p.created_at).getTime()) / 86400000, 0) / openPrs.length)
    : null;

  if (appLoading) return <div className="pt-10 text-center text-secondary text-sm">Loading dashboard...</div>;
  if (needsImport) return <div className="pt-6"><ImportReposPage /></div>;

  return (
    <div className="space-y-6 pt-6">
      {/* Active repo badge */}
      {activeRepository && (
        <div className="flex items-center gap-2 text-xs text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Showing stats for <span className="font-medium text-primary">{activeRepository.fullName}</span>
        </div>
      )}

      {/* Row 1 — Stats */}
      <StatsGrid stats={stats} loading={fetching} />

      {/* Row 2 — PR list (left) + Status Breakdown (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left: filterable PR list */}
        <PROverview prs={prs} loading={fetching} />

        {/* Right: Status Breakdown */}
        <div className="rounded-2xl border border-divider bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">Status Breakdown</h2>
            {avgAgeDays !== null && (
              <span className="text-xs text-secondary">
                Avg open age:{" "}
                <span className={`font-semibold ${avgAgeDays > 7 ? "text-amber-400" : "text-green-400"}`}>
                  {avgAgeDays}d
                </span>
              </span>
            )}
          </div>

          {/* Stacked bar */}
          {total > 0 ? (
            <>
              <div className="flex h-2 rounded-full overflow-hidden gap-px">
                {STATUS_CONFIG.map(({ key, color }) =>
                  counts[key] > 0 ? (
                    <div
                      key={key}
                      className={`${color} h-full transition-all`}
                      style={{ width: `${(counts[key] / total) * 100}%` }}
                      title={`${key}: ${counts[key]}`}
                    />
                  ) : null
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {STATUS_CONFIG.map(({ key, color, text, bg }) => (
                  <div key={key} className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${bg}`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${color} inline-block shrink-0`} />
                      <span className="text-xs text-secondary">{key}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-semibold ${text}`}>{counts[key]}</span>
                      <span className="text-[10px] text-secondary/50">
                        {Math.round((counts[key] / total) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-6 text-center text-xs text-secondary">No PR data yet</div>
          )}
        </div>
      </div>

      {/* Row 3 — Recent PRs (sorted by last updated = recently interacted with) */}
      <RecentPRs prs={prs.slice(0, 6)} loading={fetching} />
    </div>
  );
}
