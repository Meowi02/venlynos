// components/NewSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {href:"/", label:"Overview", icon:"🏠"},
  {href:"/calls", label:"Calls", icon:"📞"},
  {href:"/jobs", label:"Jobs", icon:"🗂"},
  {href:"/numbers", label:"Numbers", icon:"🔢"},
  {href:"/settings", label:"Settings", icon:"⚙️"},
  {href:"/sops", label:"SOPs", icon:"📘"},
];

export default function NewSidebar(){
  const pathname = usePathname();
  
  return (
    <aside className="fixed left-4 top-4 bottom-4 w-[240px] rounded-3xl
      bg-[linear-gradient(180deg,#0F1217_0%,#12151B_100%)]
      text-white/90 border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,.3)]
      px-3 py-4">
      <div className="mb-3 px-2 text-sm/6 text-white/60">Venlyn Ops</div>
      <nav className="space-y-1">
        {items.map(i=>{
          const isActive = pathname === i.href || (i.href !== '/' && pathname.startsWith(i.href));
          return (
            <Link key={i.href} href={i.href as any}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition ${
                isActive 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'hover:bg-white/5 active:bg-white/10'
              }`}>
              <span className="text-base">{i.icon}</span>
              <span className="text-[15px]">{i.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="absolute bottom-3 left-0 right-0 px-3">
        <button className="w-full rounded-2xl bg-white/10 hover:bg-white/15 py-2">Jarvis</button>
      </div>
    </aside>
  );
}