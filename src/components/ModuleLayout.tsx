"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Settings } from "lucide-react";

interface ModuleLayoutProps {
  children: React.ReactNode;
  title?: string; // Optional manual override for the title
  actions?: React.ReactNode; // Optional custom action buttons/elements in the header
  fullWidth?: boolean; // If true, removes max-width and paddings (useful for Kanban maps/dashboards)
}

const ROUTE_TITLES: Record<string, string> = {
  "/orders": "Pedidos & Órdenes",
  "/quotes": "Cotizaciones",
  "/products": "Catálogo de Productos",
  "/transfers": "Traspasos de Inventario",
  "/vehicles": "Control de Vehículos",
  "/dashboard": "Panel de Control",
};

export default function ModuleLayout({ children, title, actions, fullWidth }: ModuleLayoutProps) {
  const pathname = usePathname();

  // Find the matching title by checking if pathname starts with the route key
  // We sort keys by length descending to match more specific routes first (e.g. /orders/[id] vs /orders)
  const autoTitle = React.useMemo(() => {
    if (!pathname) return "Dashboard";
    
    const sortedKeys = Object.keys(ROUTE_TITLES).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (pathname === key || pathname.startsWith(key + "/")) {
        return ROUTE_TITLES[key];
      }
    }
    return "LTH Sistema";
  }, [pathname]);

  const displayTitle = title || autoTitle;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] relative">
      {/* Subtle premium radial grid background */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-70 pointer-events-none"
      />

      {/* Top Header Bar with glassmorphism blur effect */}
      <header className="h-16 bg-white/85 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-20">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-[#102B5E] font-black tracking-wider uppercase italic">
            {displayTitle}
          </span>
          <span className="text-red-500 font-bold animate-pulse">•</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-500 hover:text-[#102B5E] hover:bg-zinc-100 rounded-lg transition-all duration-200 relative group">
            <Bell size={20} className="group-hover:scale-105 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
          <button className="p-2 text-zinc-500 hover:text-[#102B5E] hover:bg-zinc-100 rounded-lg transition-all duration-200 group">
            <Settings size={20} className="group-hover:rotate-45 transition-transform duration-300" />
          </button>
          {actions && (
            <>
              <div className="h-8 w-px bg-zinc-200 mx-1 hidden sm:block" />
              <div className="flex items-center gap-2">
                {actions}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Responsive main layout container with dynamic margins */}
      <main className={
        fullWidth 
          ? "flex-1 w-full relative z-10 flex flex-col" 
          : "p-4 sm:p-6 lg:p-8 xl:p-10 w-full max-w-7xl lg:max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto transition-all duration-300 relative z-10"
      }>
        {children}
      </main>
    </div>
  );
}
