import LifecycleFilters from "../../../landingPageComponents/LifecycleFilters";
import { GitPullRequest } from "lucide-react";
import Tag from "../../../ui/Tag";
import { useState } from "react";
import { Card } from "../../../ui/Card";
import { useNavigate } from "react-router-dom";

export function PROverview({ prs = [], loading = false }) {
    const [filter, setFilter] = useState("All");

    /* Map GitHub PR → display shape */
    const mapped = prs.map((pr) => {
        let status = "Open";
        if (pr.draft) status = "Draft";
        else if (pr.merged_at) status = "Merged";
        else if (pr.state === "closed") status = "Closed";
        return {
            title: pr.title,
            repo: pr._repoName || pr.base?.repo?.full_name?.split("/")[1] || "",
            status,
            number: pr.number,
        };
    });

    const filterMap = {
        All: () => true,
        Open: (p) => p.status === "Open",
        Draft: (p) => p.status === "Draft",
        Merged: (p) => p.status === "Merged",
        Closed: (p) => p.status === "Closed",
    };

    const filtered = mapped.filter(filterMap[filter] || (() => true)).slice(0, 4);

    return (
        <Card
            title="Pull Requests"
            right={<LifecycleFilters active={filter} onChange={setFilter} />}
        >
            {loading ? (
                <PRSkeleton />
            ) : filtered.length === 0 ? (
                <div className="py-6 text-center text-xs text-secondary">No pull requests found</div>
            ) : (
                <div>
                    {filtered.map((pr, i) => (
                        <PRLifecycleRow key={i} {...pr} />
                    ))}
                </div>
            )}
        </Card>
    );
}

export default PROverview;

function PRLifecycleRow({ title, repo, status, number }) {
    const navigate = useNavigate();
    const variantMap = {
        Open: "open",
        Draft: "draft",
        Merged: "merged",
        Closed: "default",
    };

    return (
        <div
            onClick={() => navigate("/pull-requests")}
            className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-hover cursor-pointer"
        >
            <span className="flex gap-3 items-center min-w-0">
                <GitPullRequest className="h-4 w-4 text-secondary shrink-0" />
                <div className="min-w-0">
                    <div className="text-sm text-primary truncate max-w-[180px]">{title}</div>
                    <div className="text-xs text-secondary">
                        {repo}{number ? ` · #${number}` : ""}
                    </div>
                </div>
            </span>
            <Tag variant={variantMap[status] || "default"}>{status}</Tag>
        </div>
    );
}

function PRSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-md px-3 py-2">
                    <div className="h-4 w-36 rounded bg-surface-elev animate-pulse" />
                    <div className="h-5 w-14 rounded bg-surface-elev animate-pulse" />
                </div>
            ))}
        </div>
    );
}
