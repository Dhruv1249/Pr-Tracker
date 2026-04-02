import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Tag from "../ui/Tag";
import {
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Loader2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { useRepo } from "../../context/RepoContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

/* =========================
   PR DETAILS PAGE
========================= */
export default function PRDetails() {
  const { id: prNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { owner, repoName } = location.state || {};
  const { setActivePr } = useRepo();

  const [pr, setPr] = useState(null);
  const [files, setFiles] = useState([]);
  const [commits, setCommits] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(360);

  /* ---- Fetch PR data ---- */
  useEffect(() => {
    if (!owner || !repoName || !prNumber) {
      setError("Missing repo context. Please navigate from the PR list.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const base = `${serverEndpoint}/api/repos/${owner}/${repoName}/pulls/${prNumber}`;

    Promise.allSettled([
      axios.get(base, { withCredentials: true }),
      axios.get(`${base}/files`, { withCredentials: true }),
      axios.get(`${base}/commits`, { withCredentials: true }),
      axios.get(`${base}/comments`, { withCredentials: true }),
    ])
      .then(([prRes, filesRes, commitsRes, commentsRes]) => {
        if (prRes.status === "rejected") {
          setError("Failed to load PR details. Please try again.");
          return;
        }
        setPr(prRes.value.data);
        setActivePr({ number: prRes.value.data.number, title: prRes.value.data.title });
        setFiles(filesRes.status === "fulfilled" ? (filesRes.value.data || []) : []);
        setCommits(commitsRes.status === "fulfilled" ? (commitsRes.value.data || []) : []);
        setComments(commentsRes.status === "fulfilled" ? (commentsRes.value.data || []) : []);
        if (commentsRes.status === "rejected") {
          console.warn("Comments fetch failed (server may need restart):", commentsRes.reason?.message);
        }
      })
      .catch((err) => {
        console.error("Failed to load PR details", err);
        setError("Failed to load PR details. Please try again.");
      })
      .finally(() => setLoading(false));

    return () => setActivePr(null);
  }, [owner, repoName, prNumber, setActivePr]);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex items-center gap-2 text-secondary text-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading pull request…
        </div>
      </div>
    );
  }

  /* ---- Error ---- */
  if (error || !pr) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-secondary">{error || "PR not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-bg">
      {/* Sidebar */}
      <div
        style={{ width: sidebarWidth }}
        className="shrink-0 border-r border-divider bg-surface"
      >
        <div className="h-full overflow-y-auto p-4">
          <button
            onClick={() => navigate(-1)}
            className="mb-3 flex items-center gap-1 text-xs text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <PRSidebar pr={pr} owner={owner} repoName={repoName} files={files} />
        </div>
      </div>

      {/* Resizer */}
      <Resizer onResize={setSidebarWidth} />

      {/* Workspace */}
      <div className="flex-1 bg-bg overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="mx-auto max-w-5xl p-4">
            <PRWorkspace
              pr={pr}
              owner={owner}
              repoName={repoName}
              files={files}
              commits={commits}
              comments={comments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   RESIZER
========================= */
function Resizer({ onResize }) {
  const startDrag = (e) => {
    e.preventDefault();
    const onMove = (ev) => onResize(Math.max(300, Math.min(520, ev.clientX)));
    const stop = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);
  };
  return (
    <div
      onMouseDown={startDrag}
      className="w-[4px] cursor-col-resize bg-transparent hover:bg-divider transition"
    />
  );
}

/* =========================
   SIDEBAR
========================= */
function PRSidebar({ pr, owner, repoName, files = [] }) {
  let status = "Open";
  if (pr.merged_at) status = "Merged";
  else if (pr.state === "closed") status = "Closed";
  else if (pr.draft) status = "Draft";

  const variantMap = { Open: "open", Merged: "merged", Closed: "default", Draft: "draft" };

  return (
    <div className="space-y-4">

      {/* Title */}
      <div>
        <h1 className="text-[15px] font-semibold text-primary leading-snug">{pr.title}</h1>
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-secondary">{owner}/{repoName} &middot; #{pr.number}</span>
          <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary">
            <ExternalLink className="h-3 w-3 inline" />
          </a>
        </div>
      </div>

      {/* Status + Labels — top for quick scanning */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <Tag variant={variantMap[status]}>{status}</Tag>
        {pr.labels?.map((l) => (
          <span
            key={l.name}
            className="rounded-full px-2 py-0.5 text-xs text-primary"
            style={{
              background: l.color ? `#${l.color}22` : undefined,
              border: `1px solid #${l.color || "444"}44`,
            }}
          >
            {l.name}
          </span>
        ))}
      </div>

      {/* Change stats bar */}
      {files.length > 0 && (() => {
        const add = files.reduce((s, f) => s + f.additions, 0);
        const del = files.reduce((s, f) => s + f.deletions, 0);
        const total = add + del;
        return (
          <div className="flex items-center gap-3 rounded-lg border border-divider bg-surface-elev/60 px-3 py-2.5">
            <span className="text-xs font-medium text-green-400">+{add}</span>
            <span className="text-xs font-medium text-red-400">-{del}</span>
            <span className="text-xs text-secondary">{files.length} file{files.length !== 1 ? "s" : ""}</span>
            {total > 0 && (
              <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-surface min-w-0">
                <div className="h-full bg-green-500/70 rounded-full" style={{ width: `${Math.round((add / total) * 100)}%` }} />
              </div>
            )}
          </div>
        );
      })()}

      <div className="border-t border-divider" />

      {/* Branch */}
      <div className="flex items-center gap-1.5 text-xs text-secondary flex-wrap">
        <span className="rounded bg-surface-elev px-1.5 py-0.5 font-mono">{pr.head?.ref}</span>
        <span>→</span>
        <span className="rounded bg-surface-elev px-1.5 py-0.5 font-mono">{pr.base?.ref}</span>
      </div>

      {/* Author */}
      <div className="flex items-center gap-2">
        <Avatar src={pr.user?.avatar_url} name={pr.user?.login} />
        <div className="text-xs text-secondary min-w-0">
          <span className="font-medium text-primary">{pr.user?.login}</span>
          <span className="ml-1">· updated {timeAgo(pr.updated_at)}</span>
        </div>
      </div>

      {/* Description */}
      {pr.body && (
        <>
          <div className="border-t border-divider" />
          <Section title="Description">
            <MarkdownBody>{pr.body}</MarkdownBody>
          </Section>
        </>
      )}
    </div>
  );
}


/* =========================
   WORKSPACE
========================= */
function PRWorkspace({ pr, owner, repoName, files, commits, comments }) {
  const [tab, setTab] = useState("Files");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  useEffect(() => {
    if (pr?.aiAnalysis) setAiAnalysis(pr.aiAnalysis);
  }, [pr?.aiAnalysis]);

  const runAnalysis = async () => {
    try {
      setAnalyzing(true);
      setAnalysisError(null);
      const res = await axios.post(
        `${serverEndpoint}/api/repos/${owner}/${repoName}/pulls/${pr.number}/analyze`,
        {},
        { withCredentials: true }
      );
      setAiAnalysis(res.data.data?.aiAnalysis || res.data.data);
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setAnalysisError("Failed to run analysis. Make sure the AI agent is running on port 5003.");
    } finally {
      setAnalyzing(false);
    }
  };

  const tabs = [
    { id: "Files", label: `Files${files.length > 0 ? ` (${files.length})` : ""}` },
    { id: "Commits", label: `Commits${commits.length > 0 ? ` (${commits.length})` : ""}` },
    { id: "Comments", label: `Comments${comments.length > 0 ? ` (${comments.length})` : ""}` },
    { id: "Analysis", label: <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-purple-400" />Analysis{aiAnalysis ? <span className="ml-1 h-1.5 w-1.5 rounded-full bg-purple-400 inline-block" /> : null}</span> },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-6 text-sm border-b border-divider">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`pb-2 transition flex items-center gap-1 ${tab === id
              ? id === "Analysis"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-primary border-b-2 border-primary"
              : "text-secondary hover:text-primary"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "Files" && <DiffViewer files={files} />}
      {tab === "Commits" && <CommitsPanel commits={commits} />}
      {tab === "Comments" && <CommentsPanel comments={comments} />}
      {tab === "Analysis" && (
        <AnalysisPanel
          analyzing={analyzing}
          analysisError={analysisError}
          aiAnalysis={aiAnalysis}
          onRun={runAnalysis}
        />
      )}
    </div>
  );
}

/* =========================
   FILES — UNIFIED DIFF
========================= */
function DiffViewer({ files }) {
  if (!files.length) {
    return (
      <div className="rounded-lg border border-divider bg-surface p-6 text-center text-sm text-secondary">
        No file changes
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((f) => (
        <FileDiff key={f.filename} file={f} />
      ))}
    </div>
  );
}

function FileDiff({ file }) {
  const [open, setOpen] = useState(true);
  const lines = parsePatch(file.patch);

  return (
    <div className="rounded-lg border border-divider bg-surface overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-hover text-left"
      >
        <div className="flex items-center gap-2 text-xs text-primary min-w-0">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-secondary shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-secondary shrink-0" />
          )}
          <span className="truncate font-mono">{file.filename}</span>
          {file.status !== "modified" && (
            <span className="shrink-0 text-xs text-secondary capitalize">{file.status}</span>
          )}
        </div>
        <DiffStats additions={file.additions} deletions={file.deletions} />
      </button>

      {/* Diff body */}
      {open && (
        file.patch ? (
          <div className="overflow-x-auto border-t border-divider">
            <table className="w-full text-xs font-mono border-collapse">
              <tbody>
                {lines.map((l, i) => (
                  <DiffLine key={i} {...l} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-3 text-xs text-secondary border-t border-divider">
            Binary file — no preview available
          </div>
        )
      )}
    </div>
  );
}

/* Parse unified diff patch into structured lines with old/new line numbers */
function parsePatch(patch) {
  if (!patch) return [];
  const lines = patch.split("\n");
  const result = [];
  let oldLine = 0;
  let newLine = 0;

  for (const text of lines) {
    if (text.startsWith("@@")) {
      // Parse hunk header e.g.  @@ -12,7 +12,9 @@
      const m = text.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (m) {
        oldLine = parseInt(m[1], 10);
        newLine = parseInt(m[2], 10);
      }
      result.push({ type: "hunk", text, oldLine: null, newLine: null });
    } else if (text.startsWith("+") && !text.startsWith("+++")) {
      result.push({ type: "add", text: text.slice(1), oldLine: null, newLine: newLine++ });
    } else if (text.startsWith("-") && !text.startsWith("---")) {
      result.push({ type: "del", text: text.slice(1), oldLine: oldLine++, newLine: null });
    } else if (!text.startsWith("+++") && !text.startsWith("---")) {
      result.push({ type: "ctx", text: text.startsWith(" ") ? text.slice(1) : text, oldLine: oldLine++, newLine: newLine++ });
    }
  }
  return result;
}

function DiffLine({ type, text, oldLine, newLine }) {
  const bg = {
    add: "bg-green-500/10",
    del: "bg-red-500/10",
    hunk: "bg-blue-500/10",
    ctx: "",
  }[type] || "";

  const textColor = {
    add: "text-green-300",
    del: "text-red-300",
    hunk: "text-blue-400",
    ctx: "text-secondary",
  }[type] || "text-secondary";

  const prefix = { add: "+", del: "−", hunk: "", ctx: " " }[type] || " ";

  return (
    <tr className={`${bg} leading-5`}>
      {/* Old line number */}
      <td className="select-none w-10 text-right pr-2 pl-2 text-secondary/50 border-r border-divider/30 align-top shrink-0">
        {oldLine ?? ""}
      </td>
      {/* New line number */}
      <td className="select-none w-10 text-right pr-2 pl-2 text-secondary/50 border-r border-divider/30 align-top shrink-0">
        {newLine ?? ""}
      </td>
      {/* Sign */}
      <td className={`select-none w-5 text-center ${textColor} align-top`}>
        {type !== "hunk" ? prefix : ""}
      </td>
      {/* Content */}
      <td className={`px-2 py-0.5 whitespace-pre ${textColor} ${type === "hunk" ? "font-semibold" : ""}`}>
        {type === "hunk" ? text : text}
      </td>
    </tr>
  );
}

function DiffStats({ additions, deletions }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium shrink-0">
      <span className="text-green-400">+{additions}</span>
      <span className="text-red-400">−{deletions}</span>
    </div>
  );
}

/* =========================
   COMMITS
========================= */
function CommitsPanel({ commits }) {
  if (!commits.length) {
    return (
      <div className="rounded-lg border border-divider bg-surface p-4 text-sm text-secondary text-center">
        No commits found
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {commits.map((c) => (
        <div
          key={c.sha}
          className="rounded-lg border border-divider bg-surface px-3 py-2 flex items-start gap-3"
        >
          <Avatar src={c.avatarUrl} name={c.author} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-primary truncate">{c.message.split("\n")[0]}</div>
            <div className="text-xs text-secondary mt-0.5">
              {c.authorLogin || c.author} · {timeAgo(c.date)}
            </div>
          </div>
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 font-mono text-xs text-secondary hover:text-primary"
          >
            {c.sha.slice(0, 7)}
          </a>
        </div>
      ))}
    </div>
  );
}

/* =========================
   COMMENTS — REDDIT/YT STYLE
========================= */
function CommentsPanel({ comments }) {
  if (!comments.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-divider bg-surface py-10">
        <MessageSquare className="h-8 w-8 text-secondary/40" />
        <p className="text-sm text-secondary">No comments yet</p>
      </div>
    );
  }

  // Separate issue-level comments from review threads
  const reviewMap = new Map();
  const topLevelItems = [];

  for (const c of comments) {
    if (c.type === "issue") {
      topLevelItems.push({ type: "issue", comment: c });
    } else {
      // review comment
      if (c.inReplyToId) {
        const parentThread = reviewMap.get(c.inReplyToId);
        if (parentThread) {
          parentThread.replies.push(c);
          reviewMap.set(c.id, parentThread);
        } else {
          const thread = { type: "review_thread", root: c, replies: [] };
          reviewMap.set(c.id, thread);
          topLevelItems.push(thread);
        }
      } else {
        const thread = { type: "review_thread", root: c, replies: [] };
        reviewMap.set(c.id, thread);
        topLevelItems.push(thread);
      }
    }
  }

  topLevelItems.sort((a, b) => {
    const ta = new Date(a.type === "issue" ? a.comment.createdAt : a.root.createdAt).getTime();
    const tb = new Date(b.type === "issue" ? b.comment.createdAt : b.root.createdAt).getTime();
    return ta - tb;
  });

  // Split into discussion (issue) vs code review groups
  const discussionItems = topLevelItems.filter((i) => i.type === "issue");
  const reviewItems = topLevelItems.filter((i) => i.type === "review_thread");

  return (
    <div className="space-y-6">
      {/* Discussion section */}
      {discussionItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-3.5 w-3.5 text-secondary" />
            <span className="text-xs font-medium text-secondary uppercase tracking-wider">
              Discussion · {discussionItems.length} comment{discussionItems.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-0 rounded-lg border border-divider overflow-hidden">
            {discussionItems.map((item, idx) => (
              <IssueCommentCard
                key={item.comment.id}
                comment={item.comment}
                isLast={idx === discussionItems.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Code review threads */}
      {reviewItems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ChevronRight className="h-3.5 w-3.5 text-secondary" />
            <span className="text-xs font-medium text-secondary uppercase tracking-wider">
              Code Review · {reviewItems.length} thread{reviewItems.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {reviewItems.map((item) => (
              <ReviewThread key={item.root.id} thread={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Detect if a comment body is a quote-reply (starts with "> ") */
function isQuoteReply(body) {
  return typeof body === "string" && body.trimStart().startsWith(">");
}

function IssueCommentCard({ comment, isLast }) {
  const isReply = isQuoteReply(comment.body);
  return (
    <div className={`flex gap-3 px-4 py-4 ${!isLast ? "border-b border-divider" : ""} ${isReply ? "bg-surface-elev/40" : "bg-surface"} hover:bg-hover/30 transition-colors`}>
      {/* Avatar column */}
      <div className="shrink-0 flex flex-col items-center">
        <Avatar src={comment.author?.avatarUrl} name={comment.author?.login} size="md" />
        {!isLast && (
          <div className="mt-2 w-px flex-1 bg-divider min-h-[8px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 flex-wrap mb-2">
          <span className="text-xs font-semibold text-primary">{comment.author?.login}</span>
          {isReply && (
            <span className="text-xs text-accent/80 font-medium">replied</span>
          )}
          <span className="text-xs text-secondary/60">{timeAgo(comment.createdAt)}</span>
          <a
            href={comment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-secondary/50 hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Body */}
        <div className="text-xs leading-relaxed">
          <MarkdownBody>{comment.body}</MarkdownBody>
        </div>
      </div>
    </div>
  );
}

function ReviewThread({ thread }) {
  return (
    <div className="rounded-lg border border-divider bg-surface overflow-hidden">
      {/* File context header */}
      {thread.root.path && (
        <div className="px-4 py-2 bg-surface-elev border-b border-divider">
          <div className="flex items-center gap-1.5 text-xs text-secondary">
            <MessageSquare className="h-3 w-3 shrink-0 text-accent" />
            <span className="font-mono truncate">{thread.root.path}</span>
            {thread.root.line && (
              <span className="shrink-0 text-secondary/60">:{thread.root.line}</span>
            )}
            <span className="ml-auto text-xs text-secondary/50 italic shrink-0">
              code review
            </span>
          </div>
          {thread.root.diffHunk && (
            <pre className="mt-2 mb-1 overflow-x-auto text-xs font-mono text-secondary/60 leading-relaxed max-h-28 overflow-y-hidden border-l-2 border-accent/30 pl-3 bg-surface/50 rounded">
              {thread.root.diffHunk}
            </pre>
          )}
        </div>
      )}

      {/* All comments in thread, connected with avatar thread line */}
      {[thread.root, ...thread.replies].map((c, idx, arr) => (
        <div
          key={c.id}
          className={`flex gap-3 px-4 py-4 ${idx < arr.length - 1 ? "border-b border-divider" : ""} ${idx > 0 ? "bg-surface-elev/20" : "bg-surface"}`}
        >
          <div className="shrink-0 flex flex-col items-center">
            <Avatar src={c.author?.avatarUrl} name={c.author?.login} size="md" />
            {idx < arr.length - 1 && (
              <div className="mt-2 w-px flex-1 bg-divider min-h-[8px]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap mb-2">
              <span className="text-xs font-semibold text-primary">{c.author?.login}</span>
              {idx > 0 && <span className="text-xs text-accent/80 font-medium">replied</span>}
              <span className="text-xs text-secondary/60">{timeAgo(c.createdAt)}</span>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-secondary/50 hover:text-primary">
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="text-xs leading-relaxed">
              <MarkdownBody>{c.body}</MarkdownBody>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================
   SHARED UI
========================= */
/* =========================
   MARKDOWN RENDERER
========================= */
function MarkdownBody({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Paragraphs
        p({ children }) {
          return <p className="text-xs text-secondary leading-relaxed mb-2 last:mb-0">{children}</p>;
        },
        // Images — render inline with a subtle border
        img({ src, alt }) {
          return (
            <img
              src={src}
              alt={alt || ""}
              className="max-w-full rounded-md border border-divider my-2"
              loading="lazy"
            />
          );
        },
        // Links — styled accent colour, open in new tab
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline break-all"
            >
              {children}
            </a>
          );
        },
        // Preformatted text (code blocks wrapper)
        pre({ children }) {
          return (
            <pre className="overflow-x-auto rounded-md bg-surface-elev border border-divider p-2 my-2">
              {children}
            </pre>
          );
        },
        // Inline code and block code
        code({ className, children, node, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match && !String(children).includes("\n");
          if (isInline) {
            return (
              <code className="rounded bg-surface-elev px-1 py-0.5 font-mono text-xs text-primary" {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className={`font-mono text-xs text-primary ${className || ""}`} {...props}>
              {children}
            </code>
          );
        },
        // Blockquote
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-divider pl-3 my-2 text-secondary italic">
              {children}
            </blockquote>
          );
        },
        // Headings — scale them down to fit the sidebar
        h1({ children }) { return <h1 className="text-sm font-semibold text-primary mb-1">{children}</h1>; },
        h2({ children }) { return <h2 className="text-xs font-semibold text-primary mb-1">{children}</h2>; },
        h3({ children }) { return <h3 className="text-xs font-medium text-primary mb-1">{children}</h3>; },
        // Lists
        ul({ children }) { return <ul className="list-disc list-inside text-xs text-secondary space-y-0.5 mb-2">{children}</ul>; },
        ol({ children }) { return <ol className="list-decimal list-inside text-xs text-secondary space-y-0.5 mb-2">{children}</ol>; },
        li({ children }) { return <li className="text-xs text-secondary">{children}</li>; },
        // Horizontal rule
        hr() { return <hr className="border-divider my-2" />; },
        // Table (GFM)
        table({ children }) {
          return (
            <div className="overflow-x-auto my-2">
              <table className="text-xs text-secondary border-collapse w-full">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return <th className="px-2 py-1 border border-divider text-primary font-semibold text-left">{children}</th>;
        },
        td({ children }) {
          return <td className="px-2 py-1 border border-divider">{children}</td>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

/* =========================
   AI ANALYSIS PANEL
========================= */
function ReviewSection({ label, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-divider last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-hover text-left select-none group"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium tracking-widest uppercase text-secondary group-hover:text-primary transition-colors">
            {label}
          </span>
          {count != null && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elev text-secondary/60 font-mono">
              {count}
            </span>
          )}
        </div>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 text-secondary/40 shrink-0" />
          : <ChevronRight className="h-3.5 w-3.5 text-secondary/40 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0.5 space-y-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ title, detail, accent }) {
  const accentClass = {
    red: "border-l-red-500/50",
    amber: "border-l-amber-400/50",
    blue: "border-l-blue-400/50",
    default: "border-l-divider",
  }[accent] || "border-l-divider";

  return (
    <div className={`pl-3 border-l-2 ${accentClass} py-0.5`}>
      {title && <p className="text-xs font-medium text-primary mb-0.5">{title}</p>}
      <p className="text-xs text-secondary leading-relaxed">{detail}</p>
    </div>
  );
}

function InlineFeedbackCard({ file, code, suggestion }) {
  const lines = (code || "").split("\n");

  return (
    <div className="rounded-md border border-divider overflow-hidden mb-3 last:mb-0">
      {/* File header (minimal) */}
      {file && (
        <div className="px-3 py-1.5 bg-surface border-b border-divider flex items-center">
          <span className="font-mono text-[11px] text-secondary">{file}</span>
        </div>
      )}

      {/* Code block (GitHub minimal style) */}
      {code && (
        <div className="overflow-x-auto bg-[#0d1117]">
          <table className="w-full border-collapse font-mono text-[11px] leading-5">
            <tbody>
              {lines.map((line, i) => {
                const isDel = line.startsWith("-");
                const isAdd = line.startsWith("+");
                const rowBg = isDel
                  ? "bg-[#ffebe9]/10"
                  : isAdd
                    ? "bg-[#e6ffed]/10"
                    : "bg-transparent";
                const textColor = isDel
                  ? "text-[#ff7b72]"
                  : isAdd
                    ? "text-[#3fb950]"
                    : "text-[#c9d1d9]";
                const prefix = isDel ? "-" : isAdd ? "+" : " ";
                const content = line.startsWith("-") || line.startsWith("+") ? line.slice(1) : line;

                return (
                  <tr key={i} className={rowBg}>
                    <td className="select-none w-8 text-right pr-2 text-[#6e7681] border-r border-[#30363d]/50 align-top py-[2px] shrink-0">
                      {i + 1}
                    </td>
                    <td className={`select-none w-4 text-center align-top py-[2px] ${textColor}`}>
                      {prefix}
                    </td>
                    <td className={`pl-1 pr-3 py-[2px] whitespace-pre align-top ${textColor}`}>
                      {content}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Suggestion */}
      <div className="px-3 py-2.5 bg-surface border-t border-divider text-[13px] text-secondary leading-relaxed">
        {suggestion}
      </div>
    </div>
  );
}


function AnalysisPanel({ analyzing, analysisError, aiAnalysis, onRun }) {
  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-lg border border-divider">
        <Loader2 className="h-6 w-6 animate-spin text-secondary" />
        <div className="text-center">
          <p className="text-sm text-primary">Analyzing changes…</p>
          <p className="text-xs text-secondary mt-1">This may take 10–30 seconds</p>
        </div>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <ShieldAlert className="h-6 w-6 text-red-400" />
        <p className="text-sm text-secondary">{analysisError}</p>
        <button onClick={onRun} className="text-xs text-secondary hover:text-primary transition-colors">
          Try again
        </button>
      </div>
    );
  }

  if (!aiAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-lg border border-dashed border-divider">
        <Sparkles className="h-6 w-6 text-secondary/40" />
        <div className="text-center">
          <p className="text-sm font-medium text-primary">AI Code Review</p>
          <p className="text-xs text-secondary mt-1 max-w-xs">
            Run an automated review of this PR's changes using Mistral AI.
          </p>
        </div>
        <button
          onClick={onRun}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-divider text-xs text-secondary hover:text-primary hover:border-accent/40 transition-colors"
        >
          <Sparkles className="h-3 w-3" /> Run Analysis
        </button>
      </div>
    );
  }

  const riskColor = aiAnalysis.riskLevel === "high"
    ? { text: "text-red-400" }
    : aiAnalysis.riskLevel === "medium"
      ? { text: "text-amber-400" }
      : { text: "text-green-400" };
  const isClean = aiAnalysis.securityStatus !== "flagged";
  const rev = aiAnalysis.aiReview || {};

  return (
    <div className="space-y-3">
      {/* Summary block */}
      {rev.summary && (
        <div className="px-4 py-3 rounded-lg border border-divider bg-surface">
          <p className="text-[10px] font-medium tracking-widest uppercase text-secondary/60 mb-1.5">Summary</p>
          <p className="text-sm text-secondary leading-relaxed">{rev.summary}</p>
        </div>
      )}

      {/* Sections */}
      <div className="rounded-lg border border-divider bg-bg overflow-hidden">
        <ReviewSection label="Potential Bugs" count={rev.bugs?.length ?? 0} defaultOpen>
          {rev.bugs?.length > 0
            ? rev.bugs.map((b, i) => <ReviewCard key={i} title={b.title} detail={b.detail} accent="red" />)
            : <p className="text-xs text-secondary/50 italic">None identified</p>}
        </ReviewSection>

        <ReviewSection label="Code Quality" count={rev.codeQuality?.length ?? 0}>
          {rev.codeQuality?.length > 0
            ? rev.codeQuality.map((q, i) => <ReviewCard key={i} title={q.title} detail={q.detail} accent="amber" />)
            : <p className="text-xs text-secondary/50 italic">No issues found</p>}
        </ReviewSection>

        <ReviewSection label="Performance & Security" count={rev.performance?.length ?? 0}>
          {rev.performance?.length > 0
            ? rev.performance.map((p, i) => <ReviewCard key={i} title={p.title} detail={p.detail} accent="blue" />)
            : <p className="text-xs text-secondary/50 italic">No concerns identified</p>}
        </ReviewSection>

        {rev.inlineFeedback?.length > 0 && (
          <ReviewSection label="Inline Feedback" count={rev.inlineFeedback.length}>
            {rev.inlineFeedback.map((f, i) => (
              <InlineFeedbackCard key={i} file={f.file} code={f.code} suggestion={f.suggestion} />
            ))}
          </ReviewSection>
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-3 text-xs text-secondary/60 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Activity className={`h-3 w-3 ${riskColor.text}`} />
          <span>Risk <span className={`font-medium ${riskColor.text}`}>{aiAnalysis.riskLevel ?? "—"}</span></span>
        </div>
        <div className="w-px h-3 bg-divider" />
        <div className="flex items-center gap-1.5">
          <ShieldAlert className={`h-3 w-3 ${isClean ? "text-green-400" : "text-red-400"}`} />
          <span>Security <span className={`font-medium ${isClean ? "text-green-400" : "text-red-400"}`}>{isClean ? "Clean" : "Flagged"}</span></span>
        </div>
        <button onClick={onRun} className="ml-auto flex items-center gap-1 text-secondary/50 hover:text-secondary transition-colors">
          <Activity className="h-3 w-3" /> Re-run
        </button>
      </div>
      <p className="text-[10px] text-secondary/30 italic">Generated by Mistral AI · May contain errors</p>
    </div>
  );
}


function Section({ title, children }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium text-secondary uppercase tracking-wide">
        {title}
      </div>
      {children}
    </div>
  );
}

function Avatar({ src, name, size = "md" }) {
  const dim = size === "sm" ? "h-5 w-5 text-xs" : "h-6 w-6 text-xs";
  if (src) {
    return <img src={src} alt={name} className={`${dim} rounded-full object-cover shrink-0`} />;
  }
  const initials = (name || "?").slice(0, 2).toUpperCase();
  return (
    <div
      className={`${dim} rounded-full bg-surface-elev flex items-center justify-center text-primary shrink-0`}
    >
      {initials}
    </div>
  );
}

function timeAgo(date) {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
