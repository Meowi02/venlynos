"use client";

import { cn } from '@/lib/utils';
import { Intent } from '@/lib/data';

const intentStyles: Record<Intent, string> = {
  emergency: 'intent-emergency',
  routine: 'intent-routine', 
  faq: 'intent-faq',
  spam: 'intent-spam'
};

const intentLabels: Record<Intent, string> = {
  emergency: 'Emergency',
  routine: 'Routine',
  faq: 'FAQ', 
  spam: 'Spam'
};

interface IntentBadgeProps {
  intent: Intent;
}

export default function IntentBadge({ intent }: IntentBadgeProps) {
  return (
    <span className={cn('venlyn-pill border text-xs font-medium', intentStyles[intent])}>
      {intentLabels[intent]}
    </span>
  );
}

