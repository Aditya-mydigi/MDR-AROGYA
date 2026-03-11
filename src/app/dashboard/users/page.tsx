"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/header";

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed !== null) {
      setSidebarCollapsed(savedCollapsed === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  return (
    <div
      className={clsx(
        "min-h-screen bg-white flex",
        sidebarOpen && "overflow-hidden"
      )}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCloseMobile={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 bg-white">
        <Header
          title="Users"
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <h2 className="text-xl font-semibold mb-2 text-[#0a3a7a]">Users Module</h2>
            <p>This module is currently empty.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
