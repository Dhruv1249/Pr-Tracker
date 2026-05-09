import LifecycleFilters from "../../../landingPageComponents/LifecycleFilters";

function PRControls({ view, setView, filter, setFilter, search, setSearch, sort, setSort }) {
  return (
    <div className="flex flex-col gap-3 pt-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="overflow-x-auto">
        <LifecycleFilters active={filter} onChange={setFilter} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search PR title, number, or author..."
          className="min-w-0 flex-1 rounded-md border border-divider bg-surface px-3 py-1.5 text-sm text-primary placeholder:text-secondary outline-none lg:w-56 lg:flex-none"
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
        <div className="ml-0 flex overflow-hidden rounded-md border border-divider lg:ml-2">
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