"use client";

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, WifiOff, DollarSign, Phone } from 'lucide-react';

export interface Alert {
  id: string;
  type: 'a2p_incomplete' | 'budget_warning' | 'after_hours_missed' | 'webhook_fail' | 'system';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  actionLabel?: string;
}

interface AlertsCardProps {
  alerts: Alert[];
  className?: string;
}

const alertTypeIcons = {
  a2p_incomplete: Phone,
  budget_warning: DollarSign,
  after_hours_missed: Clock,
  webhook_fail: WifiOff,
  system: AlertTriangle,
};

const severityStyles = {
  high: "text-red-600 bg-red-50",
  medium: "text-yellow-600 bg-yellow-50",
  low: "text-blue-600 bg-blue-50",
};

export default function AlertsCard({ alerts, className }: AlertsCardProps) {
  return (
    <div className={cn('venlyn-card', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-text-secondary" />
          <h3 className="text-lg font-semibold text-text-primary">Alerts</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {alerts.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-text-tertiary text-sm">
            No active alerts
          </div>
        ) : (
          alerts.slice(0, 5).map((alert) => {
            const IconComponent = alertTypeIcons[alert.type];
            return (
              <div
                key={alert.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-1.5 rounded-full flex-shrink-0",
                    severityStyles[alert.severity]
                  )}>
                    <IconComponent className="w-3 h-3" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">
                          {alert.title}
                        </h4>
                        <p className="text-xs text-text-secondary mt-1">
                          {alert.description}
                        </p>
                      </div>
                      <span className="text-xs text-text-tertiary ml-2">
                        {alert.timestamp}
                      </span>
                    </div>
                    
                    {alert.actionLabel && (
                      <div className="mt-2">
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                          {alert.actionLabel}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {alerts.length > 5 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button className="text-xs text-text-secondary hover:text-text-primary transition-colors">
            View all alerts →
          </button>
        </div>
      )}
    </div>
  );
}