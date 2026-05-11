"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useOrderStore } from "@/store/useOrderStore";
import {
 X,
 MessageSquare,
 Package,
 ArrowLeftRight,
 CarIcon,
 Truck,
} from "lucide-react";

interface SidebarProps {
 isOpen: boolean;
 onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
 const pathname = usePathname();
 const { hasUnreadOrders, setHasUnreadOrders } = useOrderStore();

 useEffect(() => {
  if (pathname === "/orders" || pathname.startsWith("/orders/")) {
   setHasUnreadOrders(false);
  }
 }, [pathname, setHasUnreadOrders]);

 const menuItems = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/products", label: "Productos", icon: Package },
  // { href: "/quotes", label: "Cotizaciones", icon: File },
  { href: "/orders", label: "Pedidos", icon: Truck },
  { href: "/transfers", label: "Traspasos", icon: ArrowLeftRight },
  { href: "/vehicles", label: "Vehículos", icon: CarIcon },
 ];

 return (
  <>
   {/* Overlay for mobile with backdrop blur */}
   {isOpen && (
    <div
     className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-all duration-300"
     onClick={onClose}
    />
   )}

   <aside
    className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-950 border-r border-zinc-100 flex flex-col h-screen transition-all duration-300 ease-in-out transform lg:translate-x-0 lg:static lg:inset-auto ${
     isOpen ? "translate-x-0" : "-translate-x-full"
    } shadow-sm`}
   >
    {/* White Brand Header */}
    <div className="p-6 flex justify-center items-center bg-white border-b border-zinc-100 relative">
     <Image
      src="/lth-logo.jpg"
      alt="LTH Logo"
      width={120}
      height={50}
      className="object-contain"
      priority
     />
     <button
      onClick={onClose}
      className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-800 transition-all duration-200"
     >
      <X size={24} />
     </button>
    </div>

    {/* Navigation Section */}
    <nav className="flex-1 px-4 mt-4 space-y-2">
     {menuItems.map((item) => {
      const isActive =
       pathname === item.href ||
       (item.href !== "/" && pathname.startsWith(item.href));

      return (
       <Link
        key={item.href}
        href={item.href}
        onClick={() => {
         if (typeof window !== "undefined" && window.innerWidth < 1024) {
          onClose();
         }
        }}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
         isActive
          ? "bg-blue-300/20 text-white shadow-sm ring-1 ring-blue-300/30"
          : "text-blue-100/70 hover:bg-blue-300/10 hover:text-white hover:translate-x-1"
        }`}
       >
        <item.icon
         size={20}
         className={`transition-all duration-300 ${
          isActive ? "text-blue-300 scale-105" : "text-blue-300/50"
         }`}
        />
        <span>{item.label}</span>
        {item.label === "Pedidos" && hasUnreadOrders && (
         <span className="relative flex h-2.5 w-2.5 ml-auto shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
         </span>
        )}
       </Link>
      );
     })}
    </nav>

    {/* Classic Footer */}
    <div className="p-6 border-t border-blue-900/50">
     <div className="text-xs text-blue-400 font-medium">© 2026 LTH</div>
    </div>
   </aside>
  </>
 );
}
