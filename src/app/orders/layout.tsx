"use client";

import ModuleLayout from "@/components/ModuleLayout";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ModuleLayout>{children}</ModuleLayout>;
}
