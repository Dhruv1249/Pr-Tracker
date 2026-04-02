import LifecycleFilters from "../../../landingPageComponents/LifecycleFilters";

function PRControls({ view, setView, filter, setFilter, search, setSearch, sort, setSort }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between pt-6">
      <LifecycleFilters active={filter} onChange={setFilter} />

      <div className="flex items-center gap-2">
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search PRs..."
          className="w-56 rounded-md border border-divider bg-surface px-3 py-1.5 text-sm text-primary placeholder:text-secondary outline-none"
        />

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-md border border-divider bg-surface px-2 py-1.5 text-sm text-primary"
        >
          <option value="updated">Recently updated</option>
          <option value="created">Recently created</option>
          <option value="reviews">Review status</option>
        </select>

        {/* View toggle */}
        <div className="ml-2 flex rounded-md border border-divider overflow-hidden">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 text-sm ${view === "table"
              ? "bg-selected text-primary"
              : "text-secondary hover:bg-hover"
              }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("insights")}
            className={`px-3 py-1.5 text-sm ${view === "insights"
                ? "bg-selected text-primary"
                : "text-secondary hover:bg-hover"
              }`}
          >
            Insights
          </button>
        </div>
      </div>
    </div>
  );
}

export default PRControls;