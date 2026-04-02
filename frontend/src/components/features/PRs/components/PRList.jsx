import { useState } from "react";
import PRInsights from "../components/Views/PRInsights";
import PRTableHeader from "./Views/PRTableHeader";
import PRRow from "./Views/PRTable";
import { timeAgo } from "../../../../utils/timeAgo";
function PRList({ view, prs = [] }) {
  const [visible, setVisible] = useState(8);

  /* ---------- EMPTY STATE ---------- */
  if (!prs.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-divider bg-surface text-sm text-secondary">
        No open pull requests in this repository
      </div>
    );
  }

  /* ---------- MAP GitHub API → UI ---------- */
  const mapped = prs.map((pr) => ({
    // Use pr.number as the display ID (#42) and navigation key
    id: pr.number,
    title: pr.title,
    repo: pr.base?.repo?.full_name || "",
    // owner + name needed so PRDetails can fetch from GitHub API
    owner: pr.base?.repo?.full_name?.split("/")[0] || "",
    repoName: pr.base?.repo?.full_name?.split("/")[1] || "",
    sourceBranch: pr.head?.ref || "",
    targetBranch: pr.base?.ref || "",
    author: pr.user?.login || "",
    authorAvatar: pr.user?.avatar_url || "",
    status: deriveStatus(pr),
    // PRTable uses `pr.tags`, labels comes as [{name, color}]
    tags: pr.labels || [],
    updated: timeAgo(pr.updated_at),
    comments: pr.comments || 0,
    url: pr.html_url,
  }));

  /* ---------- KANBAN ---------- */
  if (view === "insights") {
    return <PRInsights prs={mapped} />;
  }

  /* ---------- TABLE ---------- */
  return (
    <div className="rounded-2xl border border-divider bg-surface overflow-hidden">
      <table className="w-full text-sm">
        <PRTableHeader />
        <tbody>
          {mapped.slice(0, visible).map((pr) => (
            <PRRow key={pr.id} pr={pr} />
          ))}
        </tbody>
      </table>

      {visible < mapped.length && (
        <div className="flex justify-center border-t border-divider p-3">
          <button
            onClick={() => setVisible((v) => v + 8)}
            className="text-sm text-secondary hover:text-primary"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- STATUS DERIVATION (GitHub API fields) ---------- */
function deriveStatus(pr) {
  if (pr.merged_at) return "Merged";
  if (pr.state === "closed") return "Closed";
  if (pr.draft) return "Draft";
  return "Open";
}


export default PRList;