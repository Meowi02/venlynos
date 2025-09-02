"use client";

import { Bell, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Topbar() {
  return (
    <header className="fixed top-0 left-[272px] right-0 h-16 bg-card-bg/80 backdrop-blur-sm border-b border-card-border z-30">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left spacer */}
        <div className="flex-1" />
        
        {/* Center search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search (⌘K)"
              className={cn(
                'w-full h-10 pl-10 pr-16 bg-white border border-card-border rounded-xl',
                'text-sm text-text-primary placeholder:text-text-secondary',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30',
                'transition-all duration-150 ease-out'
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="inline-flex items-center gap-1 px-2 py-1 text-xs text-text-secondary bg-gray-50 rounded border border-gray-200">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
        
        {/* Right actions */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <button 
            className={cn(
              'relative p-2.5 text-text-secondary hover:text-text-primary hover:bg-gray-50',
              'rounded-xl transition-all duration-150 ease-out hover:-translate-y-0.5',
              'focus-ring'
            )}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          <div className="flex items-center gap-3 pl-3 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>
            <div className="text-sm font-medium text-text-primary">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}

