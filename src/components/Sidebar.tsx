"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Home, LayoutDashboard, MessageSquare, Package, Archive } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/products", label: "Productos", icon: Package },
    { href: "/inventory", label: "Inventario", icon: Archive },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-950 border-r border-zinc-100 flex flex-col h-screen transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-sm`}
      >
        <div className="p-6 flex justify-between items-center bg-white">
          <Image
            src="/LTH logo.jpg"
            alt="LTH Logo"
            width={120}
            height={50}
            className="object-contain"
          />
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white rounded-lg hover:bg-blue-300/20 transition-colors"
            >
              <item.icon size={20} className="text-blue-300" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="p-6 border-t border-blue-900/50">
          <div className="text-xs text-blue-400 font-medium">© 2026 LTH</div>
        </div>
      </aside>
    </>
  );
}
