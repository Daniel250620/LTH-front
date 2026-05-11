"use client";

import ModuleLayout from "@/components/ModuleLayout";

export default function TransfersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ModuleLayout fullWidth={true}>{children}</ModuleLayout>;
}
