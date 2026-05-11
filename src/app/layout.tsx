import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LTH Dashboard",
  description: "Dashboard de gestión para LTH",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f1f5f9]`}
      >
        <SocketProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              classNames: {
                toast: "bg-slate-950/95 border border-slate-800/80 text-slate-100 rounded-2xl shadow-2xl p-4 flex gap-3 font-sans backdrop-blur-md",
                title: "text-xs font-black uppercase tracking-wider text-slate-100",
                description: "text-[11px] text-slate-300 font-bold leading-normal mt-0.5",
                actionButton: "bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200",
                closeButton: "text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all",
              },
            }}
          />
        </SocketProvider>
      </body>
    </html>
  );
}
