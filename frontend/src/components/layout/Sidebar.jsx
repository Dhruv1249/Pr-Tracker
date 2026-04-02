import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PanelLeftOpen,
  PanelLeftClose,
  LayoutDashboard,
  GitPullRequest,
  FolderGit2,
  Activity,
  MoreHorizontal,
  ChevronDown,
  LogOut,
} from "lucide-react";

import { useRepo } from "../../context/RepoContext";
import axios from "axios";

const serverEndpoint = import.meta.env.VITE_SERVER_ENDPOINT;

export function Sidebar({ user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${serverEndpoint}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside
      className={`flex h-screen flex-col border-r border-divider bg-surface transition-all duration-300 ${collapsed ? "w-16" : "w-64"
        }`}
    >
      {/* ── Top bar: repo switcher + collapse toggle ── */}
      <div className="flex h-14 items-center border-b border-divider px-3 gap-2">
        {/* Repo switcher — hidden when collapsed */}
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <RepoSwitcher />
          </div>
        )}

        {/* Collapse / expand button — always visible, centered when collapsed */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`shrink-0 rounded-md p-1 hover:bg-hover ${collapsed ? "mx-auto" : ""
            }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-secondary" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-secondary" />
          )}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        <SidebarItem
          icon={LayoutDashboard}
          label="Dashboard"
          collapsed={collapsed}
          path="/dashboard"
        />
        <SidebarItem
          icon={GitPullRequest}
          label="Pull Requests"
          collapsed={collapsed}
          path="/pull-requests"
        />
        <SidebarItem
          icon={FolderGit2}
          label="Repositories"
          collapsed={collapsed}
          path="/repos"
        />
        
      </nav>

      {/* ── Account footer ── */}
      <div className="border-t border-divider p-2 relative" ref={menuRef}>
        {/* Dropdown Menu */}
        {menuOpen && !collapsed && (
          <div className="absolute bottom-full left-2 mb-1 w-[calc(100%-16px)] rounded-md border border-divider bg-surface-elev shadow-lg z-50 overflow-hidden">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-hover hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">Log out</span>
            </button>
          </div>
        )}

        {collapsed ? (
          /* Collapsed: clicking avatar logs out directly */
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex w-full justify-center rounded-lg p-2 hover:bg-hover transition-colors"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-7 w-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-surface-elev shrink-0 flex items-center justify-center text-xs font-medium text-primary">
                {user?.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </button>
        ) : (
          <div className="flex items-center rounded-lg px-2 py-2 gap-2">
            {/* Avatar */}
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-7 w-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-surface-elev shrink-0 flex items-center justify-center text-xs font-medium text-primary">
                {user?.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-primary truncate leading-tight">
                {user?.username}
              </div>
              <div className="text-xs text-secondary truncate">
                @{user?.username}
              </div>
            </div>
            <button
              onClick={() => setMenuOpen((m) => !m)}
              className={`shrink-0 rounded-md p-1 transition-colors ${menuOpen ? "bg-selected text-primary" : "text-secondary hover:text-primary"
                }`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

/* =========================
   Repo Switcher
========================= */
function RepoSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { repos, activeRepository, setActiveRepository } = useRepo();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = activeRepository || repos?.[0] || null;

  if (!repos?.length) {
    return <span className="text-sm text-secondary truncate">No repos</span>;
  }

  return (
    <div ref={ref} className="relative w-full">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-medium text-primary"
      >
        <span className="truncate max-w-[148px]">{current?.name}</span>
        <ChevronDown
          className={`ml-1 h-4 w-4 shrink-0 text-secondary transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-8 z-50 w-52 rounded-lg border border-divider bg-surface-elev shadow-lg">
          <div className="max-h-64 overflow-auto py-1">
            {repos.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setActiveRepository(r);
                  localStorage.setItem("activeRepoId", String(r.id));
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-hover ${current?.id === r.id
                  ? "text-primary bg-selected"
                  : "text-secondary hover:text-primary"
                  }`}
              >
                <FolderGit2 className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{r.name}</span>
                {current?.id === r.id && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   Sidebar Item
========================= */
function SidebarItem({ icon: Icon, label, collapsed, path }) {
  const location = useLocation();
  // Use startsWith so /pull-requests/123 still highlights Pull Requests
  const active = path && (path === "/dashboard"
    ? location.pathname === path
    : location.pathname.startsWith(path));

  return (
    <Link
      to={path || "#"}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-lg py-2 transition-colors ${collapsed ? "justify-center px-0" : "px-3"
        } ${active
          ? "bg-selected text-primary"
          : "text-secondary hover:bg-hover hover:text-primary"
        }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {/* Label: rendered only when expanded, no opacity trick */}
      {!collapsed && (
        <span className="ml-2 text-sm whitespace-nowrap">{label}</span>
      )}
    </Link>
  );
}