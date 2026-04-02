import { useNavigate } from "react-router";
import Tag from "../../../../ui/Tag";

function PRKanban({ prs }) {
  const columns = ["Ready", "Review", "Blocked", "Stale"];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => (
        <PRColumn
          key={col}
          title={col}
          prs={prs.filter((p) => p.status === col)}
        />
      ))}
    </div>
  );
}

function PRColumn({ title, prs }) {
  return (
    <div className="rounded-2xl border border-divider bg-surface">
      <div className="px-3 py-2 border-b border-divider text-sm font-medium text-primary">
        {title} ({prs.length})
      </div>

      <div className="p-2 space-y-2">
        {prs.map((pr) => (
          <PRCard key={pr.id} pr={pr} />
        ))}
      </div>
    </div>
  );
}

function PRCard({ pr }) {
  const navigate = useNavigate();

  const variantMap = {
    Ready: "open",
    Blocked: "draft",
    Review: "review",
    Stale: "default",
  };

  return (
    <div
      onClick={() => navigate(`/pull-requests/${pr.id}`)}
      className="cursor-pointer rounded-lg border border-divider bg-surface-elev p-3 hover:bg-hover"
    >
      <div className="text-sm font-medium text-primary">
        {pr.title}
      </div>

      <div className="mt-1 text-xs text-secondary">
        {pr.repo}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {pr.tags.map((t) => (
          <Tag key={t.name} color={t.color}>
            {t.name}
          </Tag>
        ))}
      </div>

    </div>
  );
}

export default PRKanban;