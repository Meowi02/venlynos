'use client';

import { useState } from 'react';
import { CallsTable } from '@/components/calls/CallsTable';
import { CallDrawer } from '@/components/calls/CallDrawer';
import { CallsFilters } from '@/components/calls/CallsFilters';

export default function CallsPage() {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Calls</h1>
          <p className="text-slate-600">Manage and review call history</p>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Filters
        </button>
      </div>

      {/* Filters */}
      {filtersOpen && (
        <CallsFilters onClose={() => setFiltersOpen(false)} />
      )}

      {/* Calls Table */}
      <div className="bg-white rounded-lg border">
        <CallsTable 
          onCallClick={(callId) => setSelectedCallId(callId)}
        />
      </div>

      {/* Call Detail Drawer */}
      <CallDrawer
        callId={selectedCallId}
        isOpen={!!selectedCallId}
        onClose={() => setSelectedCallId(null)}
      />
    </div>
  );
}