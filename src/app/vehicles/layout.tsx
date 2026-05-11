"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import ModuleLayout from "@/components/ModuleLayout";

export default function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerActions = (
    <Link 
      href="/vehicles/new"
      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-red-600/10 hover:shadow-lg hover:shadow-red-600/20 active:translate-y-px active:scale-[0.98]"
    >
      <Plus size={14} strokeWidth={2.5} />
      <span>Nuevo vehículo</span>
    </Link>
  );

  return <ModuleLayout actions={headerActions}>{children}</ModuleLayout>;
}
