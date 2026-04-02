import Tag from "../../../../ui/Tag";
import { useNavigate } from "react-router";

function PRRow({ pr }) {
  const navigate = useNavigate();

  const variantMap = {
    Open: "open",
    Draft: "draft",
    Merged: "merged",
    Closed: "default",
  };

  const handleClick = () => {
    navigate(`/pull-requests/${pr.id}`, {
      state: { owner: pr.owner, repoName: pr.repoName },
    });
  };

  return (
    <tr
      onClick={handleClick}
      className="cursor-pointer border-t border-divider hover:bg-hover transition-colors group"
    >
      {/* PR # + Title */}
      <td className="px-4 h-14 align-middle">
        <div className="flex items-center gap-2 min-w-0 max-w-xs">
          <span className="text-sm font-medium text-primary truncate group-hover:text-accent transition-colors">
            {pr.title}
          </span>
        </div>
      </td>

      {/* Branch */}
      <td className="px-4 h-14 align-middle">
        <div className="flex items-center gap-1 text-xs text-secondary whitespace-nowrap">
          <span className="rounded bg-surface-elev px-1 py-0.5 font-mono truncate max-w-[100px]">
            {pr.sourceBranch}
          </span>
          <span className="shrink-0">→</span>
          <span className="rounded bg-surface-elev px-1.5 py-0.5 font-mono truncate max-w-[50px]">
            {pr.targetBranch}
          </span>
        </div>
      </td>

      {/* Author */}
      <td className="px-4 h-14 align-middle">
        <div className="flex items-center gap-1.5 min-w-0">
          {pr.authorAvatar ? (
            <img
              src={pr.authorAvatar}
              alt={pr.author}
              className="h-5 w-5 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-surface-elev shrink-0 flex items-center justify-center text-[10px] text-secondary">
              {pr.author?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <span className="text-xs text-secondary truncate max-w-[80px]">{pr.author}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 h-14 align-middle">
        <Tag variant={variantMap[pr.status] || "default"}>{pr.status}</Tag>
      </td>

      {/* Labels — max 2 visible, +N overflow */}
      <td className="px-4 h-14 align-middle">
        <div className="flex items-center gap-1 flex-nowrap overflow-hidden">
          {pr.tags.slice(0, 2).map((t) => (
            <Tag key={t.name} color={t.color}>
              {t.name}
            </Tag>
          ))}
          {pr.tags.length > 2 && (
            <span className="text-[10px] text-secondary shrink-0">+{pr.tags.length - 2}</span>
          )}
        </div>
      </td>

      {/* Updated */}
      <td className="px-4 h-14 align-middle">
        <span className="text-xs text-secondary whitespace-nowrap">{pr.updated}</span>
      </td>
    </tr>
  );
}

export default PRRow;
