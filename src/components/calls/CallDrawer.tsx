'use client';

import { useState, useEffect } from 'react';
import { X, Phone, Clock, User, MapPin, FileText, Plus, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/cn';
import { AudioPlayer } from '@/components/media/AudioPlayer';
import { TranscriptView } from '@/components/media/TranscriptView';
import type { Call } from '@/types/core';

interface CallDrawerProps {
  callId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CallDrawer({ callId, isOpen, onClose }: CallDrawerProps) {
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'details' | 'notes'>('summary');
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);

  useEffect(() => {
    if (isOpen && callId) {
      loadCall(callId);
    }
  }, [isOpen, callId]);

  const loadCall = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calls/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCall(data.call);
        setNotes((data.call.transcript as any)?.metadata?.notes || '');
      }
    } catch (error) {
      console.error('Failed to load call:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!call) return;
    
    try {
      const response = await fetch(`/api/calls/${call.id}/link-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Service for ${(call as any).contact?.name || 'Unknown Customer'}`,
          status: 'new',
        }),
      });

      if (response.ok) {
        // Reload call to get updated job link
        await loadCall(call.id);
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!call) return;

    try {
      const response = await fetch(`/api/calls/${call.id}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setEditingNotes(false);
        await loadCall(call.id);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const formatted = cleaned.slice(1);
      return `+1 (${formatted.slice(0,3)}) ${formatted.slice(3,6)}-${formatted.slice(6)}`;
    }
    return phone;
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDispositionColor = (disposition: string | undefined) => {
    switch (disposition) {
      case 'answered': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'spam': return 'bg-red-100 text-red-800';
      case 'callback': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Call Details
              </h2>
              {call && (
                <p className="text-sm text-slate-500">
                  {format(new Date(call.startedAt), 'MMM d, yyyy at h:mm a')}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Loading call details...</p>
              </div>
            </div>
          ) : call ? (
            <>
              {/* Tabs */}
              <div className="border-b px-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'summary' as const, label: 'Summary' },
                    { id: 'transcript' as const, label: 'Transcript' },
                    { id: 'details' as const, label: 'Details' },
                    { id: 'notes' as const, label: 'Notes' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "py-3 px-1 border-b-2 font-medium text-sm transition-colors",
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                {activeTab === 'summary' && (
                  <div className="p-6 space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Phone className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-900">Contact</span>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">
                          {(call as any).contact?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatPhoneNumber(call.fromE164)}
                        </p>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-900">Duration</span>
                        </div>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatDuration(call.durationSec)}
                        </p>
                        <p className="text-sm text-slate-600">
                          {call.direction === 'in' ? 'Inbound' : 'Outbound'} • {call.agentType === 'ai' ? 'AI' : 'Human'}
                        </p>
                      </div>
                    </div>

                    {/* Status & Value */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {call.disposition && (
                          <span className={cn(
                            "px-3 py-1 text-sm font-medium rounded-full",
                            getDispositionColor(call.disposition)
                          )}>
                            {call.disposition}
                          </span>
                        )}
                        {call.intent && (
                          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                            {call.intent}
                          </span>
                        )}
                      </div>
                      {call.valueEstCents && (
                        <div className="text-right">
                          <p className="text-sm text-slate-600">Estimated Value</p>
                          <p className="text-lg font-semibold text-slate-900">
                            ${(call.valueEstCents / 100).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Audio Player */}
                    {call.recordingUrl && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-3">Recording</h4>
                        <AudioPlayer 
                          src={call.recordingUrl}
                          onTimeUpdate={(time) => setCurrentAudioTime(time)}
                        />
                      </div>
                    )}

                    {/* Job Actions */}
                    <div className="border-t pt-6">
                      {call.jobId ? (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-900">Job Created</p>
                              <p className="text-sm text-green-700">This call has been linked to a job.</p>
                            </div>
                            <button className="px-3 py-1 text-sm font-medium text-green-700 bg-white border border-green-300 rounded hover:bg-green-50 transition-colors">
                              View Job
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleCreateJob}
                          className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Job from this Call
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'transcript' && (
                  <div className="p-6">
                    <TranscriptView
                      transcript={call.transcript as any}
                      currentTime={currentAudioTime}
                      onSeek={(time) => setCurrentAudioTime(time)}
                    />
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="text-slate-600">Call ID:</div>
                      <div className="font-mono text-slate-900">{call.id}</div>
                      
                      <div className="text-slate-600">Started:</div>
                      <div className="text-slate-900">{format(new Date(call.startedAt), 'PPpp')}</div>
                      
                      {call.endedAt && (
                        <>
                          <div className="text-slate-600">Ended:</div>
                          <div className="text-slate-900">{format(new Date(call.endedAt), 'PPpp')}</div>
                        </>
                      )}
                      
                      <div className="text-slate-600">From:</div>
                      <div className="text-slate-900">{formatPhoneNumber(call.fromE164)}</div>
                      
                      <div className="text-slate-600">To:</div>
                      <div className="text-slate-900">{formatPhoneNumber(call.toE164)}</div>
                      
                      {call.emergencyScore && (
                        <>
                          <div className="text-slate-600">Emergency Score:</div>
                          <div className="text-slate-900">{call.emergencyScore}/100</div>
                        </>
                      )}
                      
                      {call.spamScore && (
                        <>
                          <div className="text-slate-600">Spam Score:</div>
                          <div className="text-slate-900">{call.spamScore}/100</div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-slate-900">Call Notes</h4>
                      <button
                        onClick={() => setEditingNotes(!editingNotes)}
                        className="flex items-center px-3 py-1 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        {editingNotes ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    {editingNotes ? (
                      <div className="space-y-3">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={8}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add notes about this call..."
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleSaveNotes}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                          >
                            Save Notes
                          </button>
                          <button
                            onClick={() => {
                              setEditingNotes(false);
                              setNotes((call.transcript as any)?.metadata?.notes || '');
                            }}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        {notes ? (
                          <p className="text-sm text-slate-900 whitespace-pre-wrap">{notes}</p>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No notes added yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500">Failed to load call details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}