'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, MapPin, DollarSign, Clock, FileText, Camera, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/cn';
import type { Job } from '@/types/core';

interface JobDrawerProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDrawer({ jobId, isOpen, onClose }: JobDrawerProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'photos' | 'checklist'>('details');

  useEffect(() => {
    if (isOpen && jobId) {
      loadJob(jobId);
    }
  }, [isOpen, jobId]);

  const loadJob = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
      }
    } catch (error) {
      console.error('Failed to load job:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (newStatus: string) => {
    if (!job) return;

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await loadJob(job.id);
      }
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'en_route': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_site': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (cents: number | undefined) => {
    if (!cents) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const statusOptions = [
    { value: 'new', label: 'New', description: 'Job created, not scheduled' },
    { value: 'scheduled', label: 'Scheduled', description: 'Time slot assigned' },
    { value: 'en_route', label: 'En Route', description: 'Technician traveling' },
    { value: 'on_site', label: 'On Site', description: 'Work in progress' },
    { value: 'done', label: 'Complete', description: 'Job finished' },
    { value: 'cancelled', label: 'Cancelled', description: 'Job cancelled' },
  ];

  const mockChecklist = [
    { id: '1', text: 'Check existing equipment', completed: true },
    { id: '2', text: 'Take before photos', completed: true },
    { id: '3', text: 'Complete repair work', completed: false },
    { id: '4', text: 'Test functionality', completed: false },
    { id: '5', text: 'Take after photos', completed: false },
    { id: '6', text: 'Clean up work area', completed: false },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-slate-900 truncate">
                  {job?.title || 'Job Details'}
                </h2>
                {job && (
                  <span className={cn(
                    "inline-flex px-2 py-1 text-xs font-medium rounded-full border",
                    getStatusColor(job.status)
                  )}>
                    {job.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              {job && (
                <p className="text-sm text-slate-500 mt-1">
                  Job ID: {job.id.slice(-8)} • Created {format(new Date(job.createdAt), 'MMM d, yyyy')}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 ml-4"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Loading job details...</p>
              </div>
            </div>
          ) : job ? (
            <>
              {/* Quick Actions */}
              <div className="border-b px-6 py-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-700">Status:</span>
                    <select
                      value={job.status}
                      onChange={(e) => updateJobStatus(e.target.value)}
                      className="text-sm border-0 bg-transparent font-medium text-slate-900 focus:ring-0 cursor-pointer"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors">
                      Edit Job
                    </button>
                    <button className="px-3 py-1 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors">
                      Send SMS
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b px-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'details' as const, label: 'Details', icon: FileText },
                    { id: 'timeline' as const, label: 'Timeline', icon: Clock },
                    { id: 'photos' as const, label: 'Photos', icon: Camera },
                    { id: 'checklist' as const, label: 'Checklist', icon: CheckCircle },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      )}
                    >
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                {activeTab === 'details' && (
                  <div className="p-6 space-y-6">
                    {/* Key Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Customer Info */}
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <User className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-900">Customer</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {(job as any).contact?.name || 'No Contact'}
                          </p>
                          <p className="text-sm text-slate-600">
                            {(job as any).contact?.phones?.[0] || 'No phone'}
                          </p>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Calendar className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-900">Scheduled</span>
                        </div>
                        {job.slotStart ? (
                          <div>
                            <p className="font-medium text-slate-900">
                              {format(new Date(job.slotStart), 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm text-slate-600">
                              {format(new Date(job.slotStart), 'h:mm a')}
                              {job.slotEnd && (
                                <span> - {format(new Date(job.slotEnd), 'h:mm a')}</span>
                              )}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">Not scheduled</p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    {job.address && (
                      <div className="bg-white border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <MapPin className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-900">Service Address</span>
                        </div>
                        <p className="text-slate-900">{(job.address as any)?.street || 'Address not provided'}</p>
                        <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                          Open in Maps →
                        </button>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <DollarSign className="h-4 w-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-900">Pricing</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Estimate</p>
                          <p className="font-medium text-slate-900">{formatCurrency(job.estimateCents)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Final Amount</p>
                          <p className="font-medium text-slate-900">{formatCurrency(job.finalCents)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Assignment */}
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-900">Assignment</span>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Change
                        </button>
                      </div>
                      <p className="text-slate-900">
                        {job.assignedTo || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Job Created</p>
                          <p className="text-sm text-slate-500">
                            {format(new Date(job.createdAt), 'MMM d, yyyy at h:mm a')}
                          </p>
                        </div>
                      </div>
                      
                      {job.slotStart && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">Scheduled</p>
                            <p className="text-sm text-slate-500">
                              For {format(new Date(job.slotStart), 'MMM d, yyyy at h:mm a')}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-3 opacity-50">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">More events will appear here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'photos' && (
                  <div className="p-6">
                    <div className="text-center py-12">
                      <Camera className="mx-auto h-12 w-12 text-slate-400" />
                      <h3 className="mt-2 text-sm font-medium text-slate-900">No photos yet</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Photos will appear here once work begins.
                      </p>
                      <button className="mt-4 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors">
                        Upload Photos
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'checklist' && (
                  <div className="p-6">
                    <div className="space-y-3">
                      {mockChecklist.map((item) => (
                        <label key={item.id} className="flex items-center p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3"
                            readOnly
                          />
                          <span className={cn(
                            "text-sm",
                            item.completed ? "text-slate-500 line-through" : "text-slate-900"
                          )}>
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm text-slate-600 mb-2">Progress</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${(mockChecklist.filter(item => item.completed).length / mockChecklist.length) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">
                          {mockChecklist.filter(item => item.completed).length} of {mockChecklist.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500">Failed to load job details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}