"use client";

import { cn } from '@/lib/utils';

interface TrendPillProps {
  pct: number;
}

export default function TrendPill({ pct }: TrendPillProps) {
  const isPositive = pct >= 0;
  
  return (
    <span 
      className={cn(
        'venlyn-pill text-xs font-medium border',
        isPositive 
          ? 'text-green-700 bg-green-50 border-green-200' 
          : 'text-red-700 bg-red-50 border-red-200'
      )}
      aria-label={`Trend ${isPositive ? 'up' : 'down'} ${Math.abs(pct)}%`}
    >
      {isPositive ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

