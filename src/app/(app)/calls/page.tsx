'use client';

import { useState } from 'react';
import { CallsTableDemo } from '@/components/calls/CallsTableDemo';
import { CallDrawer } from '@/components/calls/CallDrawer';
import { CallsFilters } from '@/components/calls/CallsFilters';
import { Filter, Search, Calendar, BarChart3, Download, Settings } from 'lucide-react';

export default function CallsPage() {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [triageMode, setTriageMode] = useState(false);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Calls Management
            {triageMode && (
              <span className="ml-3 inline-flex items-center px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                Triage Mode Active
              </span>
            )}
          </h1>
          <p className="text-slate-600 mt-1">
            Professional call management with SLA tracking, triage workflow, and comprehensive filtering
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Quick Metrics */}
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">87%</div>
              <div>Answered</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">3</div>
              <div>Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">12</div>
              <div>Booked</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </button>
          
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {filtersOpen && (
        <CallsFilters onClose={() => setFiltersOpen(false)} />
      )}

      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Enhanced Calls Management Demo</h3>
            <p className="text-sm text-blue-700 mt-1">
              This demonstrates the new features: triage mode, bulk operations, advanced filtering, SLA tracking, 
              and professional UI enhancements. Click on any call to see the comprehensive call drawer with 6-tab interface.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Calls Table */}
      <CallsTableDemo 
        onCallClick={(callId) => setSelectedCallId(callId)}
        triageMode={triageMode}
        onTriageModeChange={setTriageMode}
      />

      {/* Enhanced Call Detail Drawer */}
      <CallDrawer
        callId={selectedCallId}
        isOpen={!!selectedCallId}
        onClose={() => setSelectedCallId(null)}
        triageMode={triageMode}
        onNext={() => console.log('Next call')}
        onPrevious={() => console.log('Previous call')}
        hasNext={true}
        hasPrevious={true}
        onAutoAdvance={() => {
          console.log('Auto-advancing to next call');
          setSelectedCallId(null);
        }}
      />
    </div>
  );
}