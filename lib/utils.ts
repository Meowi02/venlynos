import { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, inCents = false): string {
  const amount = inCents ? value / 100 : value;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function trendColor(deltaPct: number): string {
  if (deltaPct > 0) return 'text-green-600';
  if (deltaPct < 0) return 'text-red-600';
  return 'text-muted';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

