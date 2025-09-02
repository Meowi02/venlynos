'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/cn';

interface QueueItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  priority?: 'high' | 'medium' | 'low';
  timestamp?: string;
}

interface QueuesProps {
  workspaceId: string;
}

export function Queues({ workspaceId }: QueuesProps) {
  const [needsReview, setNeedsReview] = useState<QueueItem[]>([]);
  const [emergencies, setEmergencies] = useState<QueueItem[]>([]);
  const [todaysJobs, setTodaysJobs] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueueData();
  }, [workspaceId]);

  const loadQueueData = async () => {
    try {
      // Load data from APIs
      const [callsRes, jobsRes] = await Promise.all([
        fetch('/api/calls?disposition=missed&limit=5'),
        fetch('/api/jobs?range=today&limit=10'),
      ]);

      const [callsData, jobsData] = await Promise.all([
        callsRes.json(),
        jobsRes.json(),
      ]);

      // Mock data for needs review (calls that need human attention)
      const reviewItems: QueueItem[] = callsData.data?.slice(0, 3).map((call: any) => ({
        id: call.id,
        title: call.contact?.name || 'Unknown Contact',
        subtitle: `Missed call at ${format(new Date(call.startedAt), 'h:mm a')}`,
        href: `/calls/${call.id}`,
        priority: call.emergencyScore > 70 ? 'high' : 'medium',
        timestamp: call.startedAt,
      })) || [];

      // Mock emergencies (high emergency score calls without jobs)
      const emergencyItems: QueueItem[] = callsData.data?.filter((call: any) => 
        call.emergencyScore > 80 && !call.jobId
      ).slice(0, 3).map((call: any) => ({
        id: call.id,
        title: 'Emergency Call',
        subtitle: call.contact?.name || 'Unknown Contact',
        href: `/calls/${call.id}`,
        priority: 'high',
        timestamp: call.startedAt,
      })) || [];

      // Today's jobs
      const jobItems: QueueItem[] = jobsData.data?.slice(0, 5).map((job: any) => ({
        id: job.id,
        title: job.title || 'Scheduled Job',
        subtitle: job.slotStart ? 
          `${format(new Date(job.slotStart), 'h:mm a')} - ${job.contact?.name || 'No contact'}` :
          'No time set',
        href: `/jobs/${job.id}`,
        priority: 'medium',
        timestamp: job.slotStart,
      })) || [];

      setNeedsReview(reviewItems);
      setEmergencies(emergencyItems);
      setTodaysJobs(jobItems);
    } catch (error) {
      console.error('Failed to load queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg border p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-3 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Needs Review Queue */}
      <QueueCard
        title="Needs Review"
        icon={<Phone className="h-5 w-5 text-orange-600" />}
        items={needsReview}
        emptyMessage="All caught up!"
        viewAllHref="/calls?disposition=missed"
      />

      {/* Emergencies Queue */}
      <QueueCard
        title="Emergencies w/o Job"
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        items={emergencies}
        emptyMessage="No emergencies"
        viewAllHref="/calls?intent=emergency"
      />

      {/* Today's Jobs Queue */}
      <QueueCard
        title="Today's Jobs"
        icon={<Calendar className="h-5 w-5 text-blue-600" />}
        items={todaysJobs}
        emptyMessage="No jobs today"
        viewAllHref="/jobs?range=today"
      />
    </div>
  );
}

interface QueueCardProps {
  title: string;
  icon: React.ReactNode;
  items: QueueItem[];
  emptyMessage: string;
  viewAllHref: string;
}

function QueueCard({ title, icon, items, emptyMessage, viewAllHref }: QueueCardProps) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="font-medium text-slate-900">{title}</h3>
          </div>
          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {items.length}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link key={item.id} href={item.href}>
                <div className="flex items-center justify-between p-2 -m-2 rounded hover:bg-slate-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.priority === 'high' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                    <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {items.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Link 
              href={viewAllHref}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}