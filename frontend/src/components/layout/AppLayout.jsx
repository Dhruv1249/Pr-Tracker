import { useState } from "react";
import Header from "./Header";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import AiSidebar from "../features/AiSidebar";

function AppLayout({ user }) {
  const [aiOpen, setAiOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        user={user}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Right side (header + content) */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          user={user}
          onToggleAi={() => setAiOpen((o) => !o)}
          aiOpen={aiOpen}
          onToggleSidebar={() => setMobileNavOpen((o) => !o)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-bg">
          <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* AI Sidebar */}
      <AiSidebar open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}

export default AppLayout;