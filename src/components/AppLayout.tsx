"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import Image from "next/image";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f1f5f9] overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-zinc-200 flex items-center px-4 shrink-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="ml-4 flex-1 flex justify-center lg:justify-start pr-8 lg:pr-0">
            <Image
              src="/lth-logo.jpg"
              alt="LTH Logo"
              width={80}
              height={32}
              className="object-contain"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
