'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { 
  BarChart3, 
  Phone, 
  Calendar, 
  Hash, 
  Settings, 
  FileText, 
  Bot,
  Home
} from "lucide-react";

const navigation = [
  { name: 'Overview', href: '/overview', icon: Home },
  { name: 'Calls', href: '/calls', icon: Phone },
  { name: 'Jobs', href: '/jobs', icon: Calendar },
  { name: 'Numbers', href: '/numbers', icon: Hash },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'SOPs', href: '/sops', icon: FileText },
  { name: 'Jarvis', href: '/jarvis', icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center px-6 py-6 border-b border-slate-200">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-semibold text-slate-900">
            Venlyn OS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 text-center">
          v1.0.0
        </div>
      </div>
    </div>
  );
}