/* ──────────────────────────────────────────────
   PR INSIGHTS VIEW
   Replaces the Kanban view. Computes analytics
   directly from the current page's PR data.
────────────────────────────────────────────── */
function PRInsights({ prs = [] }) {
    if (!prs.length) {
        return (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-divider bg-surface text-sm text-secondary">
                No pull request data to analyse
            </div>
        );
    }

    /* ── Status breakdown ── */
    const counts = { Open: 0, Draft: 0, Merged: 0, Closed: 0 };
    prs.forEach((pr) => {
        const s = pr.status || "Open";
        counts[s] = (counts[s] || 0) + 1;
    });
    const total = prs.length;
    const statusConfig = [
        { key: "Open", color: "bg-green-500", text: "text-green-400", bg: "bg-green-500/10" },
        { key: "Merged", color: "bg-purple-500", text: "text-purple-400", bg: "bg-purple-500/10" },
        { key: "Draft", color: "bg-zinc-500", text: "text-zinc-400", bg: "bg-zinc-500/10" },
        { key: "Closed", color: "bg-red-500", text: "text-red-400", bg: "bg-red-500/10" },
    ];

    /* ── Top authors ── */
    const authorMap = {};
    prs.forEach((pr) => {
        const a = pr.author || "Unknown";
        if (!authorMap[a]) authorMap[a] = { login: a, avatar: pr.authorAvatar, open: 0, merged: 0, closed: 0 };
        if (pr.status === "Open" || pr.status === "Draft") authorMap[a].open++;
        else if (pr.status === "Merged") authorMap[a].merged++;
        else authorMap[a].closed++;
    });
    const topAuthors = Object.values(authorMap)
        .map((a) => ({ ...a, total: a.open + a.merged + a.closed }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);

    /* ── Average PR age (open PRs only) ── */
    const openPrs = prs.filter((pr) => pr.status === "Open" || pr.status === "Draft");
    const avgAgeDays = openPrs.length
        ? Math.round(
            openPrs.reduce((sum, pr) => {
                const created = new Date(pr.created_at || Date.now()).getTime();
                return sum + (Date.now() - created) / 86400000;
            }, 0) / openPrs.length
        )
        : null;

    /* ── Recent activity (last 7 days) ── */
    const MS_DAY = 86400000;
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * MS_DAY);
        return {
            label: d.toLocaleDateString("en-US", { weekday: "short" }),
            date: d.toDateString(),
            updated: 0,
        };
    });
    prs.forEach((pr) => {
        const d = new Date(pr.updated_at || "").toDateString();
        const slot = days.find((s) => s.date === d);
        if (slot) slot.updated++;
    });
    const maxActivity = Math.max(...days.map((d) => d.updated), 1);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ── Status Breakdown ── */}
            <div className="rounded-2xl border border-divider bg-surface p-5 space-y-4">
                <h3 className="text-sm font-semibold text-primary">Status Breakdown</h3>

                {/* Stacked bar */}
                <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
                    {statusConfig.map(({ key, color }) =>
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

                {/* Legend */}
                <div className="space-y-2">
                    {statusConfig.map(({ key, color, text, bg }) => (
                        <div key={key} className={`flex items-center justify-between rounded-lg px-3 py-2 ${bg}`}>
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${color} inline-block`} />
                                <span className="text-xs text-secondary">{key}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${text}`}>{counts[key]}</span>
                                <span className="text-xs text-secondary/50">
                                    {total > 0 ? Math.round((counts[key] / total) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Avg age callout */}
                {avgAgeDays !== null && (
                    <div className="rounded-lg border border-divider bg-surface-elev px-3 py-2.5 flex items-center justify-between">
                        <span className="text-xs text-secondary">Avg open PR age</span>
                        <span className={`text-sm font-semibold ${avgAgeDays > 7 ? "text-amber-400" : "text-green-400"}`}>
                            {avgAgeDays}d
                        </span>
                    </div>
                )}
            </div>

            {/* ── Top Contributors ── */}
            <div className="rounded-2xl border border-divider bg-surface p-5 space-y-3">
                <h3 className="text-sm font-semibold text-primary">Top Contributors</h3>
                <div className="space-y-2">
                    {topAuthors.map((a, i) => (
                        <div key={a.login} className="flex items-center gap-3">
                            <span className="text-xs text-secondary/40 w-4 shrink-0 text-right">{i + 1}</span>
                            {a.avatar ? (
                                <img src={a.avatar} alt={a.login} className="h-6 w-6 rounded-full object-cover shrink-0" />
                            ) : (
                                <div className="h-6 w-6 rounded-full bg-surface-elev shrink-0 flex items-center justify-center text-xs text-secondary">
                                    {a.login[0]?.toUpperCase()}
                                </div>
                            )}
                            <span className="text-sm text-primary flex-1 truncate">{a.login}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {a.open > 0 && <span className="text-[11px] text-green-400">{a.open} open</span>}
                                {a.merged > 0 && <span className="text-[11px] text-purple-400">{a.merged} merged</span>}
                                {a.closed > 0 && <span className="text-[11px] text-secondary">{a.closed} closed</span>}
                            </div>
                        </div>
                    ))}
                </div>
                {topAuthors.length === 0 && (
                    <p className="text-xs text-secondary">No contributor data</p>
                )}
            </div>

            {/* ── Activity (last 7 days) ── */}
            <div className="rounded-2xl border border-divider bg-surface p-5 space-y-3">
                <h3 className="text-sm font-semibold text-primary">Activity · Last 7 Days</h3>
                <div className="flex items-end gap-2 h-28">
                    {days.map((d) => (
                        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                            <span className="text-[10px] text-secondary">{d.updated > 0 ? d.updated : ""}</span>
                            <div className="w-full rounded-sm bg-surface-elev overflow-hidden" style={{ height: "80px" }}>
                                <div
                                    className="w-full bg-blue-500/60 rounded-sm transition-all duration-300"
                                    style={{ height: `${(d.updated / maxActivity) * 100}%`, marginTop: "auto" }}
                                />
                            </div>
                            <span className="text-[10px] text-secondary">{d.label}</span>
                        </div>
                    ))}
                </div>
                <p className="text-[11px] text-secondary/50 pt-1">
                    Based on last-updated timestamp of PRs on this page
                </p>
            </div>

        </div>
    );
}

export default PRInsights;
