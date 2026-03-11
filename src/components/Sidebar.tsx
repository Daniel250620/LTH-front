import Link from "next/link";
import Image from "next/image";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-blue-950 border-r border-zinc-100 flex flex-col h-screen sticky top-0 shadow-sm">
      <div className="p-6 flex justify-center bg-white">
        <Image
          src="/LTH logo.jpg"
          alt="LTH Logo"
          width={150}
          height={60}
          className="object-contain"
        />
      </div>
      <nav className="flex-1 px-4 mt-4 space-y-2">
        <Link
          href="/"
          className="flex items-center px-4 py-2 text-sm font-semibold text-white
           rounded-lg hover:bg-blue-300 transition-colors"
        >
          Inicio
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center px-4 py-2 text-sm font-semibold text-white
           rounded-lg hover:bg-blue-300 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/chat"
          className="flex items-center px-4 py-2 text-sm font-semibold text-white
           rounded-lg hover:bg-blue-300 transition-colors"
        >
          Chat
        </Link>
        <Link
          href="/products"
          className="flex items-center px-4 py-2 text-sm font-semibold text-white
           rounded-lg hover:bg-blue-300 transition-colors"
        >
          Productos
        </Link>
        <Link
          href="/inventory"
          className="flex items-center px-4 py-2 text-sm font-semibold text-white
           rounded-lg hover:bg-blue-300 transition-colors"
        >
          Inventario
        </Link>
      </nav>
      <div className="p-4 border-t border-zinc-100">
        <div className="text-xs text-blue-400 font-medium">© 2026 LTH</div>
      </div>
    </aside>
  );
}
