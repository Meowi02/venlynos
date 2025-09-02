'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Phone, ArrowUpDown, Eye, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Call } from '@/types/core';

interface CallsTableProps {
  onCallClick: (callId: string) => void;
}

export function CallsTable({ onCallClick }: CallsTableProps) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Call>('startedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      const response = await fetch('/api/calls');
      if (response.ok) {
        const data = await response.json();
        setCalls(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Call) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCalls(new Set(calls.map(call => call.id)));
    } else {
      setSelectedCalls(new Set());
    }
  };

  const handleSelectCall = (callId: string, checked: boolean) => {
    const newSelected = new Set(selectedCalls);
    if (checked) {
      newSelected.add(callId);
    } else {
      newSelected.delete(callId);
    }
    setSelectedCalls(newSelected);
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple phone formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const formatted = cleaned.slice(1);
      return `+1 (${formatted.slice(0,3)}) ${formatted.slice(3,6)}-${formatted.slice(6)}`;
    }
    return phone;
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

  const getIntentColor = (intent: string | undefined) => {
    switch (intent) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'routine': return 'bg-green-100 text-green-800';
      case 'quote': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      {/* Bulk Actions */}
      {selectedCalls.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700">
              {selectedCalls.size} call{selectedCalls.size > 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors">
                Mark as spam
              </button>
              <button className="px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors">
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedCalls.size === calls.length && calls.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('startedAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Time</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Intent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Disposition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Value
              </th>
              <th className="w-16 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {calls.map((call) => (
              <tr 
                key={call.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onCallClick(call.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedCalls.has(call.id)}
                    onChange={(e) => handleSelectCall(call.id, e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {format(new Date(call.startedAt), 'MMM d, h:mm a')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Phone 
                      className={cn(
                        "h-4 w-4 mr-2",
                        call.direction === 'in' ? 'text-green-600 rotate-135' : 'text-blue-600'
                      )} 
                    />
                    <span className="text-sm text-slate-700">
                      {call.direction === 'in' ? 'Inbound' : 'Outbound'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {(call as any).contact?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatPhoneNumber(call.fromE164)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {formatDuration(call.durationSec)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {call.intent && (
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      getIntentColor(call.intent)
                    )}>
                      {call.intent}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {call.disposition && (
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                      getDispositionColor(call.disposition)
                    )}>
                      {call.disposition}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {call.agentType === 'ai' ? 'AI' : 'Human'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {call.valueEstCents ? `$${(call.valueEstCents / 100).toFixed(2)}` : '--'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCallClick(call.id);
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

        {calls.length === 0 && !loading && (
          <div className="text-center py-12">
            <Phone className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No calls found</h3>
            <p className="mt-1 text-sm text-slate-500">
              There are no calls matching your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}