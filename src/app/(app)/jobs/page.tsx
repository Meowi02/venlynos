'use client';

import { useState } from 'react';
import { List, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { JobsTable } from '@/components/jobs/JobsTable';
import { JobsCalendar } from '@/components/jobs/JobsCalendar';
import { JobDrawer } from '@/components/jobs/JobDrawer';
import { CreateJobModal } from '@/components/jobs/CreateJobModal';

type ViewMode = 'list' | 'calendar';

export default function JobsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Jobs</h1>
          <p className="text-slate-600">Manage scheduled work and appointments</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center border border-slate-300 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-l-lg transition-colors",
                viewMode === 'list'
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-r-lg transition-colors",
                viewMode === 'calendar'
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </button>
          </div>

          {/* Create Job Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border">
        {viewMode === 'list' ? (
          <JobsTable 
            onJobClick={(jobId) => setSelectedJobId(jobId)}
          />
        ) : (
          <JobsCalendar
            onJobClick={(jobId) => setSelectedJobId(jobId)}
            onJobMove={(jobId, newStart, newEnd) => {
              console.log('Move job', jobId, 'to', newStart, '-', newEnd);
              // Handle job rescheduling
            }}
          />
        )}
      </div>

      {/* Job Detail Drawer */}
      <JobDrawer
        jobId={selectedJobId}
        isOpen={!!selectedJobId}
        onClose={() => setSelectedJobId(null)}
      />

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onJobCreated={(jobId) => {
          setShowCreateModal(false);
          setSelectedJobId(jobId);
        }}
      />
    </div>
  );
}