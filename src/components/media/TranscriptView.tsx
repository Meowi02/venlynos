'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/cn';

interface TranscriptSegment {
  id: string;
  speaker: 'agent' | 'customer';
  text: string;
  timestamp: number;
  confidence?: number;
}

interface TranscriptViewProps {
  transcript?: {
    segments?: TranscriptSegment[];
  };
  currentTime?: number;
  onSeek?: (timestamp: number) => void;
  className?: string;
}

export function TranscriptView({ transcript, currentTime = 0, onSeek, className }: TranscriptViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const segments = transcript?.segments || [];

  useEffect(() => {
    // Auto-scroll to current segment based on audio time
    const currentSegment = segments.find((segment, index) => {
      const nextSegment = segments[index + 1];
      return segment.timestamp <= currentTime && 
             (!nextSegment || currentTime < nextSegment.timestamp);
    });

    if (currentSegment) {
      const element = segmentRefs.current.get(currentSegment.id);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentTime, segments]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const results: string[] = [];
    const query = searchQuery.toLowerCase();

    segments.forEach(segment => {
      if (segment.text.toLowerCase().includes(query)) {
        results.push(segment.id);
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, segments]);

  useEffect(() => {
    // Scroll to current search result
    if (currentSearchIndex >= 0 && searchResults.length > 0) {
      const segmentId = searchResults[currentSearchIndex];
      const element = segmentRefs.current.get(segmentId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentSearchIndex, searchResults]);

  const handleSearchNavigation = (direction: 'prev' | 'next') => {
    if (searchResults.length === 0) return;

    if (direction === 'next') {
      setCurrentSearchIndex((prev) => 
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else {
      setCurrentSearchIndex((prev) => 
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const highlightSearchTerm = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => (
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    ));
  };

  if (!segments.length) {
    return (
      <div className={cn("bg-slate-100 p-8 rounded-lg text-center", className)}>
        <p className="text-slate-500">No transcript available</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border rounded-lg", className)}>
      {/* Search Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-900">Transcript</h3>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="mt-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Navigation */}
            {searchResults.length > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  {currentSearchIndex + 1} of {searchResults.length} results
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleSearchNavigation('prev')}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleSearchNavigation('next')}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transcript Content */}
      <div 
        ref={transcriptRef}
        className="max-h-96 overflow-y-auto p-4 space-y-4"
      >
        {segments.map((segment) => {
          const isActive = currentTime >= segment.timestamp && 
                          (segments.find(s => s.timestamp > segment.timestamp)?.timestamp ?? Infinity) > currentTime;
          const isSearchMatch = searchResults.includes(segment.id);
          const isCurrentSearchResult = searchResults[currentSearchIndex] === segment.id;

          return (
            <div
              key={segment.id}
              ref={(el) => {
                if (el) {
                  segmentRefs.current.set(segment.id, el);
                } else {
                  segmentRefs.current.delete(segment.id);
                }
              }}
              className={cn(
                "group flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer",
                isActive && "bg-blue-50 border-l-4 border-l-blue-500",
                isSearchMatch && "ring-2 ring-yellow-200",
                isCurrentSearchResult && "ring-2 ring-yellow-400",
                !isActive && "hover:bg-slate-50"
              )}
              onClick={() => onSeek?.(segment.timestamp)}
            >
              {/* Timestamp */}
              <button
                className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded min-w-0 shrink-0 hover:bg-slate-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek?.(segment.timestamp);
                }}
              >
                {formatTimestamp(segment.timestamp)}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={cn(
                    "text-xs font-medium",
                    segment.speaker === 'agent' ? "text-blue-600" : "text-green-600"
                  )}>
                    {segment.speaker === 'agent' ? 'Agent' : 'Customer'}
                  </span>
                  {segment.confidence !== undefined && segment.confidence < 0.8 && (
                    <span className="text-xs text-amber-600 bg-amber-100 px-1 rounded">
                      Low confidence
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-900 leading-relaxed">
                  {highlightSearchTerm(segment.text, searchQuery)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="border-t px-4 py-2 text-xs text-slate-500">
        {segments.length} segments • {formatTimestamp(segments[segments.length - 1]?.timestamp || 0)} total
      </div>
    </div>
  );
}