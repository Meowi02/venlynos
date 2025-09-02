"use client";

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, FileText } from 'lucide-react';

interface QueueItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'review' | 'emergency' | 'alert';
  time?: string;
  urgent?: boolean;
}

interface QueueCardProps {
  title: string;
  items: QueueItem[];
  icon?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

const typeIcons = {
  review: FileText,
  emergency: AlertTriangle,
  alert: Clock,
};

const typeStyles = {
  review: "text-amber-600 bg-amber-50",
  emergency: "text-red-600 bg-red-50", 
  alert: "text-blue-600 bg-blue-50",
};

export default function QueueCard({ 
  title, 
  items, 
  icon, 
  emptyMessage = "No items in queue",
  className 
}: QueueCardProps) {
  return (
    <div className={cn('venlyn-card', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {items.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-6 text-text-tertiary text-sm">
            {emptyMessage}
          </div>
        ) : (
          items.slice(0, 5).map((item) => {
            const IconComponent = typeIcons[item.type];
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className={cn(
                  "p-1.5 rounded-full flex-shrink-0",
                  typeStyles[item.type]
                )}>
                  <IconComponent className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.title}
                    </p>
                    {item.time && (
                      <span className="text-xs text-text-tertiary ml-2">
                        {item.time}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-text-secondary mt-1 truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                {item.urgent && (
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            );
          })
        )}
      </div>

      {items.length > 5 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button className="text-xs text-text-secondary hover:text-text-primary transition-colors">
            View all {items.length} items →
          </button>
        </div>
      )}
    </div>
  );
}