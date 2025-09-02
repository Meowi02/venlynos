'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { 
  Phone, 
  ArrowUpDown, 
  Eye, 
  MessageSquare, 
  UserPlus,
  AlertTriangle,
  Clock,
  Tag,
  Play,
  Ban,
  Download,
  Settings,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Call } from '@/types/core';

interface CallsTableDemoProps {
  onCallClick: (callId: string) => void;
  triageMode?: boolean;
  onTriageModeChange?: (enabled: boolean) => void;
}

export function CallsTableDemo({ onCallClick, triageMode = false, onTriageModeChange }: CallsTableDemoProps) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set());
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Mock data for demonstration
  const mockCalls: Call[] = [
    {
      id: '1',
      workspaceId: 'demo',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      durationSec: 300,
      direction: 'in' as const,
      fromE164: '+15551234567',
      toE164: '+15559876543',
      agentType: 'ai' as const,
      intent: 'emergency' as const,
      disposition: 'answered' as const,
      valueEstCents: 50000,
      queueStatus: 'triage' as const,
      outcomeRequired: true,
      source: 'phone' as const,
      leadSource: 'google_maps' as const,
      tags: ['emergency', 'plumbing'],
      doNotContact: false,
      followUps: [],
      attachments: [],
      createdAt: new Date().toISOString()
    },
    {
      id: '2', 
      workspaceId: 'demo',
      startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      durationSec: 180,
      direction: 'in' as const,
      fromE164: '+15557654321',
      toE164: '+15559876543',
      agentType: 'human' as const,
      intent: 'routine' as const,
      disposition: 'missed' as const,
      queueStatus: 'none' as const,
      outcomeRequired: false,
      source: 'phone' as const,
      leadSource: 'website' as const,
      tags: ['hvac'],
      doNotContact: false,
      followUps: [],
      attachments: [],
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      workspaceId: 'demo', 
      startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      endedAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
      durationSec: 480,
      direction: 'out' as const,
      fromE164: '+15559876543',
      toE164: '+15551111111', 
      agentType: 'human' as const,
      intent: 'quote' as const,
      disposition: 'booked' as const,
      valueEstCents: 125000,
      queueStatus: 'none' as const,
      outcomeRequired: false,
      source: 'manual' as const,
      leadSource: 'referral' as const,
      tags: ['electrical', 'commercial'],
      doNotContact: true,
      followUps: [],
      attachments: [],
      createdAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCalls(mockCalls);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedCalls(new Set(calls.map(call => call.id)));
    } else {
      setSelectedCalls(new Set());
    }
  }, [calls]);

  const handleSelectCall = useCallback((callId: string, checked: boolean) => {
    const newSelected = new Set(selectedCalls);
    if (checked) {
      newSelected.add(callId);
    } else {
      newSelected.delete(callId);
    }
    setSelectedCalls(newSelected);
  }, [selectedCalls]);

  const formatPhoneNumber = useCallback((phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const formatted = cleaned.slice(1);
      return `+1 (${formatted.slice(0,3)}) ${formatted.slice(3,6)}-${formatted.slice(6)}`;
    }
    return phone;
  }, []);

  const formatDuration = useCallback((seconds: number | undefined) => {
    if (!seconds) return '--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getDispositionColor = useCallback((disposition: string | undefined) => {
    switch (disposition) {
      case 'answered': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'spam': return 'bg-red-100 text-red-800';
      case 'callback': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getIntentColor = useCallback((intent: string | undefined) => {
    switch (intent) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'routine': return 'bg-green-100 text-green-800';
      case 'quote': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

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
    <div className="flex flex-col h-full bg-white rounded-lg border">
      {/* Enhanced Controls Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
        <div className="flex items-center space-x-4">
          {/* Triage Mode Toggle */}
          {onTriageModeChange && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={triageMode}
                onChange={(e) => onTriageModeChange(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Triage Mode</span>
              {triageMode && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  Active
                </span>
              )}
            </label>
          )}
          
          {/* Density Control */}
          <div className="flex items-center space-x-1 text-sm">
            <button
              onClick={() => setDensity('comfortable')}
              className={cn(
                "px-2 py-1 rounded text-xs transition-colors",
                density === 'comfortable' 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              Comfortable
            </button>
            <button
              onClick={() => setDensity('compact')}
              className={cn(
                "px-2 py-1 rounded text-xs transition-colors",
                density === 'compact' 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              Compact
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Column Manager */}
          <button
            onClick={() => setShowColumnManager(!showColumnManager)}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Columns</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Column Manager */}
      {showColumnManager && (
        <div className="px-6 py-4 border-b bg-slate-50">
          <h4 className="text-sm font-medium text-slate-900 mb-3">Manage Columns</h4>
          <div className="grid grid-cols-4 gap-2">
            {['Time', 'Direction', 'Caller', 'Duration', 'Intent', 'Disposition', 'Agent', 'Value', 'Tags'].map(column => (
              <label key={column} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{column}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedCalls.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700 font-medium">
              {selectedCalls.size} call{selectedCalls.size > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors">
                <Tag className="h-3 w-3" />
                <span>Add Tags</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors">
                <Ban className="h-3 w-3" />
                <span>Mark Spam</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors">
                <Download className="h-3 w-3" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b sticky top-0">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedCalls.size === calls.length && calls.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1 cursor-pointer hover:bg-slate-100 -m-1 p-1 rounded">
                  <span>Time</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Direction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Caller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Intent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Disposition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tags</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {calls.map((call) => {
              const isSelected = selectedCalls.has(call.id);
              const rowHeight = density === 'compact' ? 'py-2' : 'py-4';
              
              return (
                <tr 
                  key={call.id}
                  className={cn(
                    "hover:bg-slate-50 cursor-pointer transition-colors group",
                    isSelected && "bg-blue-50"
                  )}
                  onClick={() => onCallClick(call.id)}
                >
                  <td className={cn("px-4 whitespace-nowrap", rowHeight)} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectCall(call.id, e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className={cn("px-6 whitespace-nowrap", rowHeight)}>
                    <div>
                      <div className="text-sm text-slate-900">{format(new Date(call.startedAt), 'MMM d')}</div>
                      <div className="text-xs text-slate-500">{format(new Date(call.startedAt), 'h:mm a')}</div>
                    </div>
                  </td>
                  <td className={cn("px-6 whitespace-nowrap", rowHeight)}>
                    <div className="flex items-center">
                      <Phone 
                        className={cn(
                          "h-4 w-4 mr-2",
                          call.direction === 'in' ? 'text-green-600 rotate-135' : 'text-blue-600'
                        )} 
                      />
                      <span className="text-sm text-slate-700">
                        {call.direction === 'in' ? 'In' : 'Out'}
                      </span>
                    </div>
                  </td>
                  <td className={cn("px-6 whitespace-nowrap", rowHeight)}>
                    <div className="flex items-center space-x-2">
                      {call.doNotContact && <Ban className="h-3 w-3 text-red-500" />}
                      <div>
                        <div className="text-sm font-medium text-slate-900">Unknown Caller</div>
                        <div className="text-xs text-slate-500">{formatPhoneNumber(call.fromE164)}</div>
                      </div>
                    </div>
                  </td>
                  <td className={cn("px-6 whitespace-nowrap text-sm text-slate-900", rowHeight)}>
                    {formatDuration(call.durationSec)}
                  </td>
                  <td className={cn("px-6 whitespace-nowrap", rowHeight)}>
                    <div className="flex items-center space-x-1">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                        getIntentColor(call.intent)
                      )}>
                        {call.intent}
                      </span>
                      {call.intent === 'emergency' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    </div>
                  </td>
                  <td className={cn("px-6 whitespace-nowrap", rowHeight)}>
                    {call.disposition && (
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                        getDispositionColor(call.disposition)
                      )}>
                        {call.disposition}
                      </span>
                    )}
                  </td>
                  <td className={cn("px-6 whitespace-nowrap text-sm text-slate-900", rowHeight)}>
                    {call.agentType === 'ai' ? 'AI' : 'Human'}
                  </td>
                  <td className={cn("px-6 whitespace-nowrap text-sm text-slate-900", rowHeight)}>
                    {call.valueEstCents ? `$${(call.valueEstCents / 100).toFixed(0)}` : '--'}
                  </td>
                  <td className={cn("px-6 whitespace-nowrap", rowHeight)}>
                    <div className="flex flex-wrap gap-1">
                      {call.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="inline-flex px-1 py-0.5 text-xs bg-slate-100 text-slate-700 rounded">
                          {tag}
                        </span>
                      ))}
                      {(call.tags?.length || 0) > 2 && (
                        <span className="text-xs text-slate-400">+{call.tags!.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className={cn("px-6 whitespace-nowrap", rowHeight)} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-slate-400 hover:text-blue-600 rounded" title="Call">
                        <Phone className="h-3 w-3" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-green-600 rounded" title="SMS">
                        <MessageSquare className="h-3 w-3" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-purple-600 rounded" title="Create Job">
                        <UserPlus className="h-3 w-3" />
                      </button>
                      <button 
                        className="p-1 text-slate-400 hover:text-slate-600 rounded" 
                        title="View Details"
                        onClick={() => onCallClick(call.id)}
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {calls.length === 0 && (
          <div className="text-center py-12">
            <Phone className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No calls found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {triageMode 
                ? "No calls require triage at this time."
                : "There are no calls matching your current filters."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export types for other components
export type { CallsTableDemoProps };