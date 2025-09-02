// components/PageShell.tsx
import { ReactNode } from "react";

export default function PageShell({children}:{children:ReactNode}) {
  return (
    <div className="min-h-screen">
      {/* Topbar glass */}
      <header className="glass sticky top-4 mx-auto mt-4 max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-slate-500">Search ⌘K</div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}