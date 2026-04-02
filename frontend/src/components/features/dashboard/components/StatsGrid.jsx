import {
    GitPullRequest,
    FolderGit2,
    Activity,
    FileDiff,
} from "lucide-react";

export function StatsGrid({ stats = {}, loading = false }) {
    const cards = [
        {
            label: "Open PRs",
            value: stats.openPRs ?? 0,
            icon: GitPullRequest,
            trend: stats.openPRs === 1 ? "1 open pull request" : `${stats.openPRs ?? 0} open pull requests`,
        },
        {
            label: "Draft PRs",
            value: stats.draftPRs ?? 0,
            icon: FileDiff,
            trend: "Not yet ready for review",
        },
        {
            label: "Repositories",
            value: stats.repositories ?? 0,
            icon: FolderGit2,
            trend: "Imported & tracked",
        },
        {
            label: "Active Today",
            value: stats.activeToday ?? 0,
            icon: Activity,
            trend: "PRs updated in last 24h",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <StatCard key={card.label} {...card} loading={loading} />
            ))}
        </div>
    );
}

export function StatCard({ label, value, icon: Icon, trend, loading }) {
    return (
        <div className="bg-surface border border-divider rounded-2xl p-4 hover:bg-hover transition">
            <div className="flex items-center justify-between">
                <div className="text-xs text-secondary">{label}</div>
                <Icon className="h-4 w-4 text-secondary" />
            </div>

            <div className="mt-2 text-2xl font-semibold text-primary">
                {loading ? (
                    <div className="h-7 w-10 rounded bg-surface-elev animate-pulse" />
                ) : (
                    value
                )}
            </div>

            <div className="text-xs text-secondary mt-1">{trend}</div>
        </div>
    );
}