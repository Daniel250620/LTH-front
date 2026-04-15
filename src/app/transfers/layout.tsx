"use client";

import { Bell, Settings } from "lucide-react";

export default function TransfersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Top Header Bar */}
      <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#19213d] font-bold">Traspasos</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>
      <main className="flex-1 w-full flex flex-col">{children}</main>
    </div>
  );
}
