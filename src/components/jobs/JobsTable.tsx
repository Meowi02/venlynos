'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, User, MapPin, DollarSign, Eye, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Job } from '@/types/core';

interface JobsTableProps {
  onJobClick: (jobId: string) => void;
}

export function JobsTable({ onJobClick }: JobsTableProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof Job>('slotStart');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Job) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'en_route': return 'bg-yellow-100 text-yellow-800';
      case 'on_site': return 'bg-orange-100 text-orange-800';
      case 'done': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (cents: number | undefined) => {
    if (!cents) return '--';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>Job</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Customer
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('slotStart')}
              >
                <div className="flex items-center space-x-1">
                  <span>Scheduled</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Assigned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estimate
              </th>
              <th className="w-16 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {jobs.map((job) => (
              <tr 
                key={job.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onJobClick(job.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-slate-900">
                        {job.title || 'Untitled Job'}
                      </div>
                      <div className="text-sm text-slate-500">
                        ID: {job.id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                    getStatusColor(job.status)
                  )}>
                    {job.status.replace('_', ' ')}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {(job as any).contact?.name || 'No Contact'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {(job as any).contact?.phones?.[0] || '--'}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {job.slotStart ? (
                    <div>
                      <div className="text-sm text-slate-900">
                        {format(new Date(job.slotStart), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-slate-500">
                        {format(new Date(job.slotStart), 'h:mm a')}
                        {job.slotEnd && (
                          <span> - {format(new Date(job.slotEnd), 'h:mm a')}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">Not scheduled</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {job.assignedTo ? (
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-sm text-slate-900">{job.assignedTo}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">Unassigned</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {formatCurrency(job.estimateCents)}
                  </div>
                  {job.finalCents && job.finalCents !== job.estimateCents && (
                    <div className="text-sm text-green-600">
                      Final: {formatCurrency(job.finalCents)}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onJobClick(job.id);
                    }}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {jobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No jobs found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create your first job to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}