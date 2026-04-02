import { Plus, GitBranch } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { timeAgo } from "../../utils/timeAgo";
import { useRepo } from "../../context/RepoContext";
import { ImportRepoModal } from "../features/repos/ImportRepoModal";

export function RepositoriesPage() {
  const { repos, activeRepository, setActiveRepository } = useRepo();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6 pt-6">
      <RepoHeader onImport={() => setModalOpen(true)} />
      <RepoGrid
        repos={repos}
        activeRepository={activeRepository}
        setActiveRepository={setActiveRepository}
      />

      <ImportRepoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

function RepoHeader({ onImport }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-primary">
          Repositories
        </h1>
        <p className="text-sm text-secondary">
          All repositories you imported
        </p>
      </div>

      <button
        onClick={onImport}
        className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-black hover:opacity-90 transition-opacity"
      >
        <Plus className="h-4 w-4" />
        Import Repository
      </button>
    </div>
  );
}

function RepoGrid({ repos, activeRepository, setActiveRepository }) {
  const navigate = useNavigate();

  if (!repos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-secondary gap-2">
        <GitBranch className="h-8 w-8 opacity-30" />
        <p className="text-sm">No repositories imported yet.</p>
        <p className="text-xs opacity-60">Click "Import Repository" to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo) => (
        <RepoCard
          key={repo.id}
          repo={repo}
          isActive={activeRepository?.id === repo.id}
          onSelect={() => {
            setActiveRepository(repo);
            localStorage.setItem("activeRepoId", String(repo.id));
            navigate("/pull-requests");
          }}
        />
      ))}
    </div>
  );
}

function RepoCard({ repo, isActive, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border p-4 transition-colors hover:bg-surface-elev ${isActive
          ? "border-accent/60 bg-accent/5"
          : "border-divider bg-surface"
        }`}
    >
      <div className="flex items-center gap-2">
        <GitBranch
          className={`h-4 w-4 ${isActive ? "text-accent" : "text-secondary"}`}
        />
        <span className="text-sm font-medium text-primary flex-1 truncate">
          {repo.name}
        </span>
        {isActive && (
          <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-secondary">{repo.prs} open PRs</span>
        <span className="text-secondary">Updated {repo.updated}</span>
      </div>
    </div>
  );
}
