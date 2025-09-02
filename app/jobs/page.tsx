"use client";

import * as React from 'react';
import { jobs as seededJobs } from '@/lib/data';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Plus } from 'lucide-react';

type JobStatus = 'new' | 'scheduled' | 'en_route' | 'on_site' | 'done' | 'cancelled';

interface Job {
  id: string;
  title: string;
  status: JobStatus;
  slot_start: string;
  slot_end: string;
  address: string;
  contact_name?: string;
  tech_name?: string;
  estimate_cents?: number;
}

// Mock enhanced job data
const mockJobs: Job[] = [
  {
    id: 'j1',
    title: 'HVAC System Repair',
    status: 'scheduled',
    slot_start: '2024-01-15T10:00:00Z',
    slot_end: '2024-01-15T12:00:00Z',
    address: '123 Maple St, Springfield',
    contact_name: 'Sarah Williams',
    tech_name: 'Mike Johnson',
    estimate_cents: 35000
  },
  {
    id: 'j2',
    title: 'Water Heater Installation',
    status: 'en_route',
    slot_start: '2024-01-15T14:00:00Z',
    slot_end: '2024-01-15T16:00:00Z',
    address: '456 Oak Ave, Springfield',
    contact_name: 'John Miller',
    tech_name: 'Dave Smith',
    estimate_cents: 85000
  },
  {
    id: 'j3',
    title: 'Pipe Leak Repair',
    status: 'done',
    slot_start: '2024-01-14T09:00:00Z',
    slot_end: '2024-01-14T11:00:00Z',
    address: '789 Pine Dr, Springfield',
    contact_name: 'Lisa Johnson',
    tech_name: 'Mike Johnson',
    estimate_cents: 25000
  }
];

const statusColumns = [
  { id: 'scheduled', title: 'Scheduled', color: 'bg-blue-50 border-blue-200' },
  { id: 'en_route', title: 'En Route', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'on_site', title: 'On Site', color: 'bg-orange-50 border-orange-200' },
  { id: 'done', title: 'Completed', color: 'bg-green-50 border-green-200' }
];

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(cents / 100);
};

export default function JobsPage() {
  const [jobs, setJobs] = React.useState(mockJobs);
  const [view, setView] = React.useState<'board' | 'calendar'>('board');

  function moveJob(id: string, newStatus: JobStatus) {
    setJobs(jobs => jobs.map(job => 
      job.id === id ? { ...job, status: newStatus } : job
    ));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    
    const jobId = String(active.id);
    const newStatus = String(over.id) as JobStatus;
    
    if (['scheduled', 'en_route', 'on_site', 'done'].includes(newStatus)) {
      moveJob(jobId, newStatus);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Jobs</h1>
          <p className="text-text-secondary mt-2">
            Manage and track job progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('board')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'board' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === 'calendar' ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Calendar
            </button>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {view === 'board' ? (
        <DndContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {statusColumns.map(column => (
              <JobColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                jobs={jobs.filter(job => job.status === column.id)}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        <div className="venlyn-card">
          <div className="text-center py-12 text-text-secondary">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Calendar view coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface JobColumnProps {
  id: string;
  title: string;
  color: string;
  jobs: Job[];
}

function JobColumn({ id, title, color, jobs }: JobColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`venlyn-card h-fit min-h-[400px] transition-colors ${
        isOver ? 'ring-2 ring-blue-500/40' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <Badge variant="outline" className="text-xs">
          {jobs.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

interface JobCardProps {
  job: Job;
}

function JobCard({ job }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
    id: job.id 
  });
  
  const style = transform ? { 
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` 
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-70 shadow-lg' : ''
      }`}
    >
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-text-primary line-clamp-1">
            {job.title}
          </h4>
          {job.contact_name && (
            <p className="text-sm text-text-secondary">
              {job.contact_name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <Clock className="w-3 h-3" />
            <span>
              {formatTime(job.slot_start)} - {formatTime(job.slot_end)}
            </span>
          </div>
          
          <div className="flex items-start gap-1 text-xs text-text-secondary">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{job.address}</span>
          </div>

          {job.tech_name && (
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <User className="w-3 h-3" />
              <span>{job.tech_name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {job.estimate_cents && (
            <span className="text-sm font-medium text-text-primary">
              {formatCurrency(job.estimate_cents)}
            </span>
          )}
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

