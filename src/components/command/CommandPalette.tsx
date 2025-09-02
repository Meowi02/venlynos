'use client';

import { useState, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockResults = [
  { type: 'navigation', title: 'Overview', subtitle: 'Go to dashboard', href: '/overview' },
  { type: 'navigation', title: 'Calls', subtitle: 'View call history', href: '/calls' },
  { type: 'navigation', title: 'Jobs', subtitle: 'Manage scheduled jobs', href: '/jobs' },
  { type: 'contact', title: 'John Smith', subtitle: '+1 (555) 123-4567', href: '/contacts/1' },
  { type: 'contact', title: 'Jane Doe', subtitle: '+1 (555) 987-6543', href: '/contacts/2' },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState(mockResults);

  useEffect(() => {
    if (query) {
      const filtered = mockResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults(mockResults);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === 'k') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-lg">
        <div className="floating-container overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-slate-200">
            <Search className="h-5 w-5 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Search contacts, calls, jobs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-0 text-slate-900 placeholder-slate-500"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto py-2">
            {filteredResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-slate-500">
                No results found
              </div>
            ) : (
              filteredResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors group"
                  onClick={onClose}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900">
                        {result.title}
                      </div>
                      <div className="text-sm text-slate-500">
                        {result.subtitle}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">⌘K</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}