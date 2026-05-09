import { ChevronRight, GitPullRequest, Sparkles, Menu } from "lucide-react";
import { useRepo } from "../../context/RepoContext";
import { useLocation, Link, useNavigate } from "react-router-dom";

const ROUTE_LABELS = {
    "/dashboard": "Dashboard",
    "/pull-requests": "Pull Requests",
    "/repos": "Repositories",
    "/activity": "Activity",
};

function Header({ onToggleAi, aiOpen, onToggleSidebar }) {
    const { activeRepository, activePr } = useRepo();
    const location = useLocation();
    const navigate = useNavigate();

    /* ── Breadcrumbs ── */
    const crumbs = [];
    if (activeRepository) crumbs.push({ label: activeRepository.name, url: "/dashboard" });

    const path = location.pathname;
    const routeKey = Object.keys(ROUTE_LABELS).find(
        (k) => path.startsWith(k) && (k !== "/dashboard" || path === "/dashboard")
    );
    if (routeKey) crumbs.push({ label: ROUTE_LABELS[routeKey], url: routeKey });
    if (path.startsWith("/pull-requests/") && activePr)
        crumbs.push({ label: activePr.title || `PR #${activePr.number}`, url: path });

    return (
        <header className="sticky top-0 z-50 flex h-14 w-full items-center border-b border-divider bg-bg/80 backdrop-blur-md px-4 gap-4">

            {/* Mobile nav */}
            <button
                type="button"
                onClick={onToggleSidebar}
                className="inline-flex rounded-md p-2 text-secondary hover:bg-hover hover:text-primary lg:hidden"
                aria-label="Open navigation"
            >
                <Menu className="h-4 w-4" />
            </button>

            {/* Left — Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm min-w-0 flex-1">
                <GitPullRequest className="h-3.5 w-3.5 text-accent shrink-0 mr-1" />
                {crumbs.map((crumb, idx) => {
                    const isLast = idx === crumbs.length - 1;
                    return (
                        <div key={idx} className="flex items-center gap-1 min-w-0">
                            <Link
                                to={crumb.url}
                                className={`truncate font-medium transition-colors ${isLast ? "text-primary" : "text-secondary hover:text-primary"
                                    }`}
                                title={crumb.label}
                            >
                                {crumb.label}
                            </Link>
                            {!isLast && <ChevronRight className="h-3 w-3 text-secondary/40 shrink-0" />}
                        </div>
                    );
                })}
            </nav>

            {/* Right — AI Toggle */}
            <div className="flex-1 flex justify-end shrink-0">
                <button
                    onClick={onToggleAi}
                    title="AI Assistant"
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        aiOpen
                            ? "bg-purple-500/15 text-purple-400"
                            : "text-secondary hover:text-primary hover:bg-hover"
                    }`}
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">AI</span>
                </button>
            </div>
        </header>
    );
}

export default Header;