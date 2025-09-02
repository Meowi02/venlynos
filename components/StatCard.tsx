"use client";

import { cn, formatCurrency } from '@/lib/utils';
import TrendPill from './TrendPill';

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: string;
  trend?: { pct: number };
  className?: string;
}

export default function StatCard({
  title,
  value,
  suffix,
  trend,
  className
}: StatCardProps) {
  const formatted = typeof value === 'string' && suffix === '$'
    ? `$${value}`
    : suffix === '$'
      ? formatCurrency(value as number)
      : suffix === '%'
        ? `${value}%`
        : typeof value === 'string'
          ? value
          : (value as number).toLocaleString();
      
  return (
    <div className={cn('venlyn-card group', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-text-secondary font-medium">{title}</div>
        {trend && <TrendPill pct={trend.pct} />}
      </div>
      <div className="text-3xl font-bold text-text-primary font-mono tracking-tight">
        {formatted}
      </div>
    </div>
  );
}

