"use client";

import { useState, useMemo } from 'react';
import DataTable from '@/components/DataTable';
import IntentBadge from '@/components/IntentBadge';
import DispositionBadge from '@/components/DispositionBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import CallDetailDrawer from '@/components/CallDetailDrawer';
import { calls, CallItem } from '@/lib/data';
import { formatDuration, formatCurrency } from '@/lib/utils';
import { Search, Filter, Download, Play, MessageSquare, Plus } from 'lucide-react';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const formatPhoneNumber = (e164: string) => {
  // Format +15551234567 to (555) 123-4567
  const cleaned = e164.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned[0] === '1') {
    const number = cleaned.slice(1);
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  return e164;
};

export default function CallsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCall, setSelectedCall] = useState<CallItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    intent: [] as string[],
    disposition: [] as string[],
    agentType: [] as string[],
    hasJob: null as boolean | null,
    needsReview: false,
    emergency: false,
  });

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !call.caller_name?.toLowerCase().includes(searchLower) &&
          !call.from_e164.includes(searchTerm) &&
          !call.intent?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Intent filter
      if (filters.intent.length > 0 && call.intent && !filters.intent.includes(call.intent)) {
        return false;
      }

      // Disposition filter
      if (filters.disposition.length > 0 && !filters.disposition.includes(call.disposition)) {
        return false;
      }

      // Agent type filter
      if (filters.agentType.length > 0 && !filters.agentType.includes(call.agent_type)) {
        return false;
      }

      // Has job filter
      if (filters.hasJob !== null) {
        if (filters.hasJob && !call.job_id) return false;
        if (!filters.hasJob && call.job_id) return false;
      }

      // Needs review filter
      if (filters.needsReview && call.escalation_status === 'none') {
        return false;
      }

      // Emergency filter
      if (filters.emergency && call.intent !== 'emergency') {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }, [searchTerm, filters]);

  const handleRowClick = (call: CallItem) => {
    setSelectedCall(call);
    setDrawerOpen(true);
  };

  const columns = [
    {
      header: 'Time',
      accessorKey: 'started_at',
      cell: ({ row }: { row: { original: CallItem } }) => (
        <span className="text-sm font-medium text-text-primary">
          {formatDate(row.original.started_at)}
        </span>
      )
    },
    {
      header: 'Caller',
      accessorKey: 'caller_name',
      cell: ({ row }: { row: { original: CallItem } }) => (
        <div>
          <div className="text-sm font-medium text-text-primary">
            {row.original.caller_name || 'Unknown'}
          </div>
          <div className="text-xs text-text-secondary">
            {formatPhoneNumber(row.original.from_e164)}
          </div>
        </div>
      )
    },
    {
      header: 'Intent',
      accessorKey: 'intent',
      cell: ({ row }: { row: { original: CallItem } }) => (
        row.original.intent ? <IntentBadge intent={row.original.intent} /> : <span className="text-xs text-text-tertiary">-</span>
      )
    },
    {
      header: 'Disposition',
      accessorKey: 'disposition',
      cell: ({ row }: { row: { original: CallItem } }) => (
        <DispositionBadge disposition={row.original.disposition} />
      )
    },
    {
      header: 'Duration',
      accessorKey: 'duration_sec',
      cell: ({ row }: { row: { original: CallItem } }) => (
        <span className="text-mono text-sm font-medium text-text-primary">
          {row.original.duration_sec ? formatDuration(row.original.duration_sec) : '-'}
        </span>
      )
    },
    {
      header: 'Recording',
      accessorKey: 'recording_url',
      cell: ({ row }: { row: { original: CallItem } }) => (
        row.original.recording_url ? (
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
            <Play className="h-3 w-3" />
          </Button>
        ) : (
          <span className="text-xs text-text-tertiary">-</span>
        )
      )
    },
    {
      header: 'Value Est.',
      accessorKey: 'value_est_cents',
      cell: ({ row }: { row: { original: CallItem } }) => (
        <span className="text-mono text-sm font-medium text-text-primary">
          {row.original.value_est_cents ? formatCurrency(row.original.value_est_cents, true) : '-'}
        </span>
      )
    },
    {
      header: 'Agent',
      accessorKey: 'agent_type',
      cell: ({ row }: { row: { original: CallItem } }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.agent_type.toUpperCase()}
        </Badge>
      )
    },
    {
      header: 'Source Number',
      accessorKey: 'to_e164',
      cell: ({ row }: { row: { original: CallItem } }) => (
        <span className="text-mono text-sm text-text-secondary">
          {formatPhoneNumber(row.original.to_e164)}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Calls</h1>
        <p className="text-text-secondary mt-2">
          View and manage all incoming and outgoing calls
        </p>
      </div>

      {/* Filters and Search */}
      <div className="venlyn-card">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <Input
                placeholder="Search calls by name, number, or intent..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={filters.emergency ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, emergency: !prev.emergency }))}
            >
              Emergency Calls
            </Button>
            <Button
              variant={filters.needsReview ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, needsReview: !prev.needsReview }))}
            >
              Needs Review
            </Button>
            <Button
              variant={filters.hasJob === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                hasJob: prev.hasJob === true ? null : true 
              }))}
            >
              Has Job
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Showing {filteredCalls.length} of {calls.length} calls
        </p>
        
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Call
          </Button>
        </div>
      </div>

      {/* Calls Table */}
      <div className="venlyn-card p-0">
        <DataTable
          columns={columns}
          data={filteredCalls.slice(0, 50)} // Paginate in real app
          onRowClick={handleRowClick}
        />
      </div>

      {/* Call Detail Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          {selectedCall && (
            <CallDetailDrawer
              call={selectedCall}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}