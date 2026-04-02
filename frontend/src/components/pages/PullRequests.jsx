import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import PRControls from "../features/PRs/components/PRControls";
import PRList from "../features/PRs/components/PRList";
import { useRepo } from "../../context/RepoContext";

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

const PER_PAGE_OPTIONS = [10, 20, 50];

export function PullRequestsPage() {
  const [view, setView] = useState("table");
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { activeRepository } = useRepo();

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Filter / search / sort (still client-side within a page)
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updated");

  /* ---------- FETCH ---------- */
  const fetchPRs = useCallback(async (isRefresh = false, targetPage = page) => {
    if (!activeRepository?.owner || !activeRepository?.name) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { owner, name } = activeRepository;
      const res = await axios.get(
        `${serverEndpoint}/api/repos/${owner}/${name}/pulls?state=all&page=${targetPage}&per_page=${perPage}`,
        { withCredentials: true }
      );
      const payload = res.data;
      // Support both old flat-array response and new paginated envelope
      if (Array.isArray(payload)) {
        setPrs(payload);
        setHasNextPage(false);
      } else {
        setPrs(payload.data || []);
        setHasNextPage(payload.hasNextPage ?? false);
      }
    } catch (err) {
      console.error("Failed to load PRs", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeRepository, perPage, page]);

  /* ---------- Re-fetch when repo, page, or perPage changes ---------- */
  useEffect(() => {
    fetchPRs(false, page);
  }, [activeRepository, page, perPage]); // eslint-disable-line

  // Reset to page 1 when repo changes
  useEffect(() => {
    setPage(1);
  }, [activeRepository]);

  /* ---------- Hourly background polling ---------- */
  useEffect(() => {
    if (!activeRepository?.owner || !activeRepository?.name) return;

    const POLL_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
    const interval = setInterval(() => {
      fetchPRs(true, page);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeRepository, page, fetchPRs]);

  /* ---------- FILTER & SORT (client-side within current page) ---------- */
  const deriveStatus = (pr) => {
    if (pr.merged_at) return "Merged";
    if (pr.state === "closed") return "Closed";
    if (pr.draft) return "Draft";
    return "Open";
  };

  const filteredPrs = prs
    .filter((pr) => {
      if (filter !== "All") {
        if (deriveStatus(pr) !== filter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = pr.title?.toLowerCase().includes(q);
        const matchesNumber = String(pr.number).includes(q);
        const matchesAuthor = pr.user?.login?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNumber && !matchesAuthor) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "created") return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "updated") return new Date(b.updated_at) - new Date(a.updated_at);
      if (sort === "reviews") return (b.comments || 0) - (a.comments || 0);
      return 0;
    });

  /* ---------- PAGINATION CONTROLS ---------- */
  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };
  const handleNext = () => {
    if (hasNextPage) setPage((p) => p + 1);
  };
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const PaginationBar = (
    <div className="flex items-center justify-between pt-1 pb-2">
      <div className="flex items-center gap-2 text-xs text-secondary">
        <span>Rows per page:</span>
        {PER_PAGE_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => handlePerPageChange(opt)}
            className={`w-8 h-7 rounded-md transition-colors text-xs font-medium ${perPage === opt
              ? "bg-selected text-primary"
              : "hover:bg-hover text-secondary"
              }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-secondary mr-1">Page {page}</span>
        <button
          onClick={handlePrev}
          disabled={page === 1 || loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-divider text-xs text-secondary hover:bg-hover hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>
        <button
          onClick={handleNext}
          disabled={!hasNextPage || loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-divider text-xs text-secondary hover:bg-hover hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  /* ---------- HEADER ---------- */
  const Header = (
    <div className="flex items-center justify-between pt-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Pull Requests</h1>
        {activeRepository && (
          <p className="text-xs text-secondary mt-0.5">
            {activeRepository.fullName} · {prs.length} on this page
          </p>
        )}
      </div>

      <button
        onClick={() => fetchPRs(true, page)}
        disabled={refreshing || loading}
        title="Refresh pull requests"
        className="flex items-center gap-1.5 rounded-md border border-divider px-3 py-1.5 text-sm text-secondary hover:bg-hover hover:text-primary transition-colors disabled:opacity-40"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="space-y-6">
        {Header}
        <PRControls
          view={view} setView={setView}
          filter={filter} setFilter={setFilter}
          search={search} setSearch={setSearch}
          sort={sort} setSort={setSort}
        />
        <div className="rounded-2xl border border-divider bg-surface p-8 flex items-center justify-center">
          <div className="flex items-center gap-2 text-secondary text-sm">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading pull requests…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Header}
      <PRControls
        view={view} setView={setView}
        filter={filter} setFilter={setFilter}
        search={search} setSearch={setSearch}
        sort={sort} setSort={setSort}
      />
      <PRList view={view} prs={filteredPrs} />
      {PaginationBar}
    </div>
  );
}