'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Job } from '@/types/core';

interface JobsCalendarProps {
  onJobClick: (jobId: string) => void;
  onJobMove: (jobId: string, newStart: Date, newEnd: Date) => void;
  onSlotClick?: (date: Date) => void;
}

interface CalendarJob extends Job {
  slotStartDate: Date;
  slotEndDate?: Date;
}

export function JobsCalendar({ onJobClick, onJobMove, onSlotClick }: JobsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<CalendarJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [currentDate]);

  const loadJobs = async () => {
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      const response = await fetch(
        `/api/jobs?from=${monthStart.toISOString()}&to=${monthEnd.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const jobsWithDates: CalendarJob[] = (data.data || [])
          .filter((job: Job) => job.slotStart)
          .map((job: Job) => ({
            ...job,
            slotStartDate: parseISO(job.slotStart!),
            slotEndDate: job.slotEnd ? parseISO(job.slotEnd) : undefined,
          }));
        setJobs(jobsWithDates);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'scheduled': return 'bg-purple-500';
      case 'en_route': return 'bg-yellow-500';
      case 'on_site': return 'bg-orange-500';
      case 'done': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get calendar days (including leading/trailing days from adjacent months)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getJobsForDay = (date: Date) => {
    return jobs.filter(job => isSameDay(job.slotStartDate, date));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <p className="text-sm text-slate-600">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} this month
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-slate-700 bg-slate-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const dayJobs = getJobsForDay(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isCurrentDay = isToday(date);
            
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "min-h-[120px] border-r border-b p-2 transition-colors",
                  !isCurrentMonth && "bg-slate-50",
                  isCurrentDay && "bg-blue-50",
                  "hover:bg-slate-50 cursor-pointer"
                )}
                onClick={() => onSlotClick?.(date)}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm font-medium",
                    !isCurrentMonth && "text-slate-400",
                    isCurrentDay && "text-blue-600 bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center"
                  )}>
                    {format(date, 'd')}
                  </span>
                  
                  {dayJobs.length > 0 && (
                    <span className="text-xs text-slate-500">
                      {dayJobs.length}
                    </span>
                  )}
                </div>

                {/* Jobs for this day */}
                <div className="space-y-1">
                  {dayJobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobClick(job.id);
                      }}
                      className={cn(
                        "px-2 py-1 text-xs rounded text-white cursor-pointer hover:opacity-80 transition-opacity",
                        getStatusColor(job.status)
                      )}
                      title={`${job.title || 'Untitled Job'} - ${job.status}`}
                    >
                      <div className="truncate font-medium">
                        {format(job.slotStartDate, 'h:mm a')}
                      </div>
                      <div className="truncate">
                        {job.title || 'Untitled Job'}
                      </div>
                    </div>
                  ))}
                  
                  {dayJobs.length > 3 && (
                    <div className="text-xs text-slate-500 px-2">
                      +{dayJobs.length - 3} more
                    </div>
                  )}
                  
                  {dayJobs.length === 0 && isCurrentMonth && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSlotClick?.(date);
                      }}
                      className="w-full py-1 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-xs">
        {[
          { status: 'new', label: 'New' },
          { status: 'scheduled', label: 'Scheduled' },
          { status: 'en_route', label: 'En Route' },
          { status: 'on_site', label: 'On Site' },
          { status: 'done', label: 'Complete' },
          { status: 'cancelled', label: 'Cancelled' },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center space-x-1">
            <div className={cn("w-3 h-3 rounded", getStatusColor(status))} />
            <span className="text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}