import Tag from "../../../ui/Tag";
import { Card } from "../../../ui/Card";
import { useNavigate } from "react-router-dom";

export function RecentPRs({ prs = [], loading = false }) {
    const navigate = useNavigate();

    const mapped = prs.map((pr) => {
        let status = "Open";
        if (pr.draft) status = "Draft";
        else if (pr.merged_at) status = "Merged";
        else if (pr.state === "closed") status = "Closed";
        return {
            title: pr.title,
            repo: pr._repoFullName || pr.base?.repo?.full_name || "",
            status,
            updated: timeAgo(pr.updated_at),
            number: pr.number,
        };
    });

    return (
        <Card
            title="Recent Pull Requests"
            right={
                <button
                    onClick={() => navigate("/pull-requests")}
                    className="text-xs text-secondary hover:text-primary transition-colors"
                >
                    View all
                </button>
            }
        >
            {loading ? (
                <PRSkeleton />
            ) : mapped.length === 0 ? (
                <div className="py-6 text-center text-xs text-secondary">No recent pull requests</div>
            ) : (
                <div>
                    {mapped.map((pr, i) => (
                        <PRRow key={i} {...pr} onNavigate={() => navigate("/pull-requests")} />
                    ))}
                </div>
            )}
        </Card>
    );
}

export default RecentPRs;

export function PRRow({ title, repo, status, updated, number, onNavigate }) {
    const variantMap = {
        Open: "open",
        Merged: "merged",
        Draft: "draft",
        Closed: "default",
    };

    return (
        <div
            onClick={onNavigate}
            className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-hover cursor-pointer"
        >
            <div className="min-w-0 flex-1 mr-2">
                <div className="text-sm text-primary truncate max-w-[200px]">{title}</div>
                <div className="text-xs text-secondary">
                    {repo}{number ? ` · #${number}` : ""}{updated ? ` · ${updated}` : ""}
                </div>
            </div>
            <Tag variant={variantMap[status] || "default"}>{status}</Tag>
        </div>
    );
}

function PRSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-md px-3 py-2">
                    <div className="space-y-1.5">
                        <div className="h-4 w-40 rounded bg-surface-elev animate-pulse" />
                        <div className="h-3 w-24 rounded bg-surface-elev animate-pulse" />
                    </div>
                    <div className="h-5 w-14 rounded bg-surface-elev animate-pulse" />
                </div>
            ))}
        </div>
    );
}

/* ---------- TIME AGO ---------- */
function timeAgo(date) {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}