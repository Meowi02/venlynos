"use client";

import { cn } from '@/lib/utils';
import { Disposition } from '@/lib/data';

const dispositionStyles: Record<Disposition, string> = {
  answered: 'disposition-answered',
  missed: 'disposition-missed',
  booked: 'disposition-booked',
  callback: 'bg-purple-50 text-purple-700 border-purple-200'
};

const dispositionLabels: Record<Disposition, string> = {
  answered: 'Answered',
  missed: 'Missed',
  booked: 'Booked',
  callback: 'Callback'
};

interface DispositionBadgeProps {
  disposition: Disposition;
}

export default function DispositionBadge({ disposition }: DispositionBadgeProps) {
  return (
    <span className={cn('venlyn-pill border text-xs font-medium', dispositionStyles[disposition])}>
      {dispositionLabels[disposition]}
    </span>
  );
}

