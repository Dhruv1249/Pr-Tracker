import { useState } from "react";
import Header from "./Header";
import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";
import AiSidebar from "../features/AiSidebar";

function AppLayout({ user }) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Right side (header + content) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header user={user} onToggleAi={() => setAiOpen((o) => !o)} aiOpen={aiOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-bg">
          <div className="mx-auto max-w-auto px-6 pb-6">
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