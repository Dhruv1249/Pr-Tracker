import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Github, X, CheckCircle2, Loader2 } from "lucide-react";
import { useRepo } from "../../../context/RepoContext";

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

/* ============================================================
   ImportRepoModal
   - Shows only repos NOT yet imported (not in user.repositories)
   - On success: calls refreshRepos() from context, then closes
============================================================ */
export function ImportRepoModal({ open, onClose }) {
    const { user, refreshRepos } = useRepo();

    // "idle" | "loading" | "success" | "error"
    const [phase, setPhase] = useState("idle");
    const [ghRepos, setGhRepos] = useState([]);
    const [selected, setSelected] = useState([]);
    const [importing, setImporting] = useState(false);
    const [done, setDone] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const backdropRef = useRef(null);

    /* ---------- fetch on open ---------- */
    useEffect(() => {
        if (!open) return;

        // reset state each time the modal opens
        setSelected([]);
        setDone(false);
        setErrorMsg("");
        setPhase("loading");

        (async () => {
            try {
                const res = await axios.get(`${serverEndpoint}/api/repos`, {
                    withCredentials: true,
                });

                const all = res.data || [];
                const importedIds = user?.repositories || [];

                // filter out already-imported repos
                const available = all.filter(
                    (r) => !importedIds.includes(r.githubRepoId)
                );

                setGhRepos(available);
                setPhase("idle");
            } catch (err) {
                console.error("Failed to fetch GitHub repos", err);
                setErrorMsg("Could not load repositories. Please try again.");
                setPhase("error");
            }
        })();
    }, [open, user]);

    /* ---------- close on backdrop click ---------- */
    const handleBackdrop = (e) => {
        if (e.target === backdropRef.current) onClose();
    };

    /* ---------- selection ---------- */
    const toggle = (id) =>
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const toggleAll = () =>
        setSelected(
            selected.length === ghRepos.length ? [] : ghRepos.map((r) => r.githubRepoId)
        );

    /* ---------- import ---------- */
    const handleImport = async () => {
        if (!selected.length) return;
        setImporting(true);
        setErrorMsg("");

        try {
            // Track each selected repo — this saves the Repository doc to MongoDB
            // and bulk-imports all PRs in one shot.
            const reposToTrack = ghRepos.filter((r) =>
                selected.includes(r.githubRepoId)
            );

            const results = await Promise.allSettled(
                reposToTrack.map((r) =>
                    axios.post(
                        `${serverEndpoint}/api/repos/track`,
                        { owner: r.owner, name: r.name },
                        { withCredentials: true }
                    )
                )
            );

            const failed = results.filter((r) => r.status === "rejected");
            if (failed.length) {
                console.warn("Some repos failed to import:", failed);
                if (failed.length === reposToTrack.length) {
                    throw new Error("All repo imports failed");
                }
            }

            setDone(true);

            // Refresh global repo list (sidebar + repositories page)
            await refreshRepos();

            // Close after brief success flash
            setTimeout(() => {
                onClose();
                setDone(false);
            }, 1400);
        } catch (err) {
            console.error("Import failed", err);
            setErrorMsg("Import failed. Please try again.");
        } finally {
            setImporting(false);
        }
    };

    if (!open) return null;

    return (
        /* ---- Backdrop ---- */
        <div
            ref={backdropRef}
            onClick={handleBackdrop}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
            {/* ---- Panel ---- */}
            <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-divider bg-surface shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-divider px-5 py-4">
                    <div className="flex items-center gap-2">
                        <Github className="h-4 w-4 text-secondary" />
                        <span className="text-sm font-semibold text-primary">
                            Import Repositories
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-secondary hover:bg-hover hover:text-primary transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-4">

                    {/* Subtext */}
                    <p className="text-xs text-secondary">
                        Select GitHub repositories to add to PR Tracker. Repositories you've already imported are hidden.
                    </p>

                    {/* ---- LOADING ---- */}
                    {phase === "loading" && (
                        <div className="flex flex-col items-center justify-center py-10 gap-3 text-secondary">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-xs">Fetching your repositories…</span>
                        </div>
                    )}

                    {/* ---- ERROR ---- */}
                    {phase === "error" && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {errorMsg}
                        </div>
                    )}

                    {/* ---- DONE ---- */}
                    {done && (
                        <div className="flex flex-col items-center justify-center py-10 gap-3 text-emerald-400">
                            <CheckCircle2 className="h-8 w-8" />
                            <span className="text-sm font-medium">Imported successfully!</span>
                        </div>
                    )}

                    {/* ---- REPO LIST ---- */}
                    {phase === "idle" && !done && (
                        <>
                            {ghRepos.length === 0 ? (
                                <div className="py-10 text-center text-sm text-secondary">
                                    All your repositories are already imported! 🎉
                                </div>
                            ) : (
                                <>
                                    {/* Select-all row */}
                                    <div className="flex items-center justify-between text-xs">
                                        <button
                                            onClick={toggleAll}
                                            className="text-secondary hover:text-primary transition-colors"
                                        >
                                            {selected.length === ghRepos.length ? "Deselect all" : "Select all"}
                                        </button>
                                        <span className="text-secondary">
                                            {selected.length} selected
                                        </span>
                                    </div>

                                    {/* Repo rows */}
                                    <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                                        {ghRepos.map((repo) => {
                                            const isChecked = selected.includes(repo.githubRepoId);
                                            return (
                                                <label
                                                    key={repo.githubRepoId}
                                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${isChecked ? "bg-selected" : "hover:bg-hover"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggle(repo.githubRepoId)}
                                                        className="accent-white shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <span className="block text-sm text-primary truncate">
                                                            {repo.name}
                                                        </span>
                                                        {repo.fullName && (
                                                            <span className="block text-xs text-secondary truncate">
                                                                {repo.fullName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {repo.private && (
                                                        <span className="shrink-0 text-xs text-disabled border border-divider rounded px-1.5 py-0.5">
                                                            private
                                                        </span>
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Import error message */}
                                    {errorMsg && (
                                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400">
                                            {errorMsg}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {phase === "idle" && !done && ghRepos.length > 0 && (
                    <div className="flex gap-3 border-t border-divider px-5 py-4">
                        <button
                            onClick={handleImport}
                            disabled={!selected.length || importing}
                            className="flex-1 flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-40 transition-opacity"
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Importing…
                                </>
                            ) : (
                                `Import ${selected.length > 0 ? `(${selected.length})` : "selected"}`
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-md border border-divider px-4 py-2 text-sm text-secondary hover:bg-hover transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Footer for no-repos state */}
                {phase === "idle" && !done && ghRepos.length === 0 && (
                    <div className="border-t border-divider px-5 py-4">
                        <button
                            onClick={onClose}
                            className="w-full rounded-md border border-divider px-4 py-2 text-sm text-secondary hover:bg-hover transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
