"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutGrid, 
  Phone, 
  ClipboardList, 
  Hash, 
  Settings, 
  BookOpen, 
  Bot,
  User,
  LogOut
} from 'lucide-react';

const navigationItems = [
  { href: '/', label: 'Overview', icon: LayoutGrid },
  { href: '/calls', label: 'Calls', icon: Phone },
  { href: '/jobs', label: 'Jobs', icon: ClipboardList },
  { href: '/numbers', label: 'Numbers', icon: Hash },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/sops', label: 'SOPs', icon: BookOpen },
  { href: '/jarvis', label: 'Jarvis', icon: Bot }
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <div className="fixed left-0 top-0 h-full w-[272px] glass-sidebar flex flex-col z-40">
      {/* Logo/Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-slate-800 font-bold text-lg">V</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">VenlynOps</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navigationItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            
            return (
              <Link key={href} href={href as any}>
                <div
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-out',
                    'focus-ring',
                    isActive 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Admin Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white/90 text-sm font-medium">Admin</div>
            <div className="text-white/60 text-xs">admin@plumbco.com</div>
          </div>
          <button className="p-2 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-full transition-colors duration-150">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

