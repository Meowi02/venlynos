"use client";

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, MessageSquare } from 'lucide-react';

export interface TodayJob {
  id: string;
  time: string;
  title: string;
  address: string;
  status: 'scheduled' | 'en_route' | 'on_site';
  tech?: string;
  customerName?: string;
}

interface TodayJobsCardProps {
  jobs: TodayJob[];
  className?: string;
}

const statusStyles = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  en_route: "bg-yellow-50 text-yellow-700 border-yellow-200", 
  on_site: "bg-green-50 text-green-700 border-green-200",
};

const statusLabels = {
  scheduled: "Scheduled",
  en_route: "En Route",
  on_site: "On Site",
};

export default function TodayJobsCard({ jobs, className }: TodayJobsCardProps) {
  return (
    <div className={cn('venlyn-card', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-text-secondary" />
          <h3 className="text-lg font-semibold text-text-primary">Today&apos;s Jobs</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {jobs.length}
        </Badge>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-6 text-text-tertiary text-sm">
            No jobs scheduled for today
          </div>
        ) : (
          jobs.slice(0, 4).map((job) => (
            <div
              key={job.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm font-medium text-text-primary">
                    {job.time}
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs border", statusStyles[job.status])}
                >
                  {statusLabels[job.status]}
                </Badge>
              </div>

              <h4 className="font-medium text-text-primary mb-1 truncate">
                {job.title}
              </h4>

              {job.customerName && (
                <p className="text-sm text-text-secondary mb-2">
                  Customer: {job.customerName}
                </p>
              )}

              <div className="flex items-center gap-1 text-sm text-text-secondary mb-3">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{job.address}</span>
              </div>

              {job.tech && (
                <div className="text-xs text-text-tertiary mb-3">
                  Assigned to: {job.tech}
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                  View Details
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Notify ETA
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {jobs.length > 4 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-xs text-text-secondary hover:text-text-primary transition-colors">
            View all {jobs.length} jobs →
          </button>
        </div>
      )}
    </div>
  );
}