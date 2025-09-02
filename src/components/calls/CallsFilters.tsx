'use client';

import { useState } from 'react';
import { X, Calendar, Filter } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CallsFiltersProps {
  onClose: () => void;
  onFiltersChange?: (filters: any) => void;
}

export function CallsFilters({ onClose, onFiltersChange }: CallsFiltersProps) {
  const [filters, setFilters] = useState({
    dateRange: { from: '', to: '' },
    intent: [] as string[],
    disposition: [] as string[],
    agentType: '',
    valueRange: { min: '', max: '' },
  });

  const intents = [
    { value: 'emergency', label: 'Emergency' },
    { value: 'routine', label: 'Routine' },
    { value: 'quote', label: 'Quote' },
    { value: 'faq', label: 'FAQ' },
    { value: 'billing', label: 'Billing' },
    { value: 'spam', label: 'Spam' },
  ];

  const dispositions = [
    { value: 'answered', label: 'Answered' },
    { value: 'missed', label: 'Missed' },
    { value: 'booked', label: 'Booked' },
    { value: 'spam', label: 'Spam' },
    { value: 'callback', label: 'Callback' },
  ];

  const agentTypes = [
    { value: '', label: 'All' },
    { value: 'ai', label: 'AI' },
    { value: 'human', label: 'Human' },
  ];

  const handleMultiSelect = (field: 'intent' | 'disposition', value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const applyFilters = () => {
    onFiltersChange?.(filters);
    onClose();
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { from: '', to: '' },
      intent: [],
      disposition: [],
      agentType: '',
      valueRange: { min: '', max: '' },
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-medium text-slate-900">Filters</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.from}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, from: e.target.value }
              }))}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={filters.dateRange.to}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, to: e.target.value }
              }))}
              className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Intent */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Intent
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {intents.map(intent => (
              <label key={intent.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.intent.includes(intent.value)}
                  onChange={() => handleMultiSelect('intent', intent.value)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-700">{intent.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Disposition */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Disposition
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {dispositions.map(disposition => (
              <label key={disposition.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.disposition.includes(disposition.value)}
                  onChange={() => handleMultiSelect('disposition', disposition.value)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-700">{disposition.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Agent Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Agent Type
          </label>
          <select
            value={filters.agentType}
            onChange={(e) => setFilters(prev => ({ ...prev, agentType: e.target.value }))}
            className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {agentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
        <button
          onClick={clearFilters}
          className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          Clear all
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>
  );
}