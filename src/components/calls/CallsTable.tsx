'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { 
  Phone, 
  ArrowUpDown, 
  Eye, 
  Plus, 
  MessageSquare, 
  UserPlus,
  AlertTriangle,
  Clock,
  Tag,
  Play,
  Ban,
  Download,
  Settings,
  ChevronDown,
  Trash2,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Call } from '@/types/core';
// import { FixedSizeList as List } from 'react-window'; // Temporarily disabled for dependency issues

interface CallsTableProps {
  onCallClick: (callId: string) => void;
  triageMode?: boolean;
  onTriageModeChange?: (enabled: boolean) => void;
  filters?: CallsFilters;
  savedViews?: SavedView[];
  onSaveView?: (name: string, filters: CallsFilters) => void;
  onLoadView?: (view: SavedView) => void;
}

interface CallsFilters {
  from?: string;
  to?: string;
  intent?: string[];
  disposition?: string[];
  agentType?: string[];
  valueMin?: number;
  valueMax?: number;
  hasJob?: boolean;
  hasRecording?: boolean;
  hasTranscript?: boolean;
  dnc?: boolean;
  tags?: string[];
  search?: string;
  triageMode?: boolean;
}

interface SavedView {
  id: string;
  name: string;
  filters: CallsFilters;
  isTeamView: boolean;
}

interface Column {
  id: string;
  label: string;
  width: number;
  sortable: boolean;
  visible: boolean;
}

interface CallRowProps {
  index: number;
  style: any;
  data: {
    calls: Call[];
    selectedCalls: Set<string>;
    onCallClick: (callId: string) => void;
    onSelectCall: (callId: string, selected: boolean) => void;
    columns: Column[];
    showHoverActions: boolean;
    onQuickAction: (action: string, callId: string) => void;
  };
}

export function CallsTable({ 
  onCallClick, 
  triageMode = false, 
  onTriageModeChange,
  filters = {},
  savedViews = [],
  onSaveView,
  onLoadView
}: CallsTableProps) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalls, setSelectedCalls] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Call>('startedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [showHoverActions, setShowHoverActions] = useState(false);
  const listRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  
  // Default column configuration
  const [columns, setColumns] = useState<Column[]>([
    { id: 'time', label: 'Time', width: 160, sortable: true, visible: true },
    { id: 'direction', label: 'Direction', width: 100, sortable: false, visible: true },
    { id: 'caller', label: 'Caller', width: 200, sortable: true, visible: true },
    { id: 'duration', label: 'Duration', width: 100, sortable: true, visible: true },
    { id: 'intent', label: 'Intent', width: 120, sortable: true, visible: true },
    { id: 'disposition', label: 'Disposition', width: 130, sortable: true, visible: true },
    { id: 'agent', label: 'Agent', width: 80, sortable: true, visible: true },
    { id: 'value', label: 'Value', width: 100, sortable: true, visible: true },
    { id: 'tags', label: 'Tags', width: 150, sortable: false, visible: true },
    { id: 'recording', label: 'Recording', width: 80, sortable: false, visible: true },
    { id: 'followup', label: 'Follow-up', width: 120, sortable: true, visible: true },
    { id: 'job', label: 'Job', width: 100, sortable: false, visible: true },
    { id: 'actions', label: 'Actions', width: 100, sortable: false, visible: true },
  ]);

  useEffect(() => {
    loadCalls();
  }, [filters, triageMode, sortField, sortDirection]);
  
  // Load column preferences from localStorage
  useEffect(() => {
    const savedColumns = localStorage.getItem('calls-table-columns');
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (e) {
        console.warn('Failed to load column preferences');
      }
    }
    
    const savedDensity = localStorage.getItem('calls-table-density');
    if (savedDensity && (savedDensity === 'comfortable' || savedDensity === 'compact')) {
      setDensity(savedDensity);
    }
  }, []);
  
  // Save column preferences
  useEffect(() => {
    localStorage.setItem('calls-table-columns', JSON.stringify(columns));
  }, [columns]);
  
  useEffect(() => {
    localStorage.setItem('calls-table-density', density);
  }, [density]);

  const loadCalls = async (loadMore = false) => {
    try {
      setLoading(!loadMore);
      
      // Build query parameters from filters
      const params = new URLSearchParams();
      
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      
      filters.intent?.forEach(intent => params.append('intent', intent));
      filters.disposition?.forEach(disp => params.append('disposition', disp));
      filters.agentType?.forEach(type => params.append('agentType', type));
      
      if (filters.valueMin !== undefined) params.append('valueMin', filters.valueMin.toString());
      if (filters.valueMax !== undefined) params.append('valueMax', filters.valueMax.toString());
      
      if (filters.hasJob !== undefined) params.append('hasJob', filters.hasJob.toString());
      if (filters.hasRecording !== undefined) params.append('hasRecording', filters.hasRecording.toString());
      if (filters.hasTranscript !== undefined) params.append('hasTranscript', filters.hasTranscript.toString());
      if (filters.dnc !== undefined) params.append('dnc', filters.dnc.toString());
      
      filters.tags?.forEach(tag => params.append('tag', tag));
      
      if (filters.search) params.append('search', filters.search);
      if (triageMode) params.append('triageMode', 'true');
      
      if (loadMore && cursor) params.append('cursor', cursor);
      
      params.append('limit', '50');
      
      const response = await fetch(`/api/calls?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        
        if (loadMore) {
          setCalls(prev => [...prev, ...(data.data || [])]);
        } else {
          setCalls(data.data || []);
          setSelectedCalls(new Set()); // Clear selection on new load
        }
        
        setHasMore(data.hasMore || false);
        setCursor(data.nextCursor);
      }
    } catch (error) {
      console.error('Failed to load calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = useCallback((field: keyof Call) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, sortDirection]);

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
  
  const handleQuickAction = useCallback(async (action: string, callId: string) => {
    switch (action) {
      case 'call':
        // Implement click-to-call
        console.log('Calling:', callId);
        break;
      case 'sms':
        // Implement SMS
        console.log('SMS:', callId);
        break;
      case 'job':
        // Create job
        console.log('Create job:', callId);
        break;
      case 'spam':
        // Mark as spam
        console.log('Mark spam:', callId);
        break;
      case 'tag':
        // Add tag
        console.log('Add tag:', callId);
        break;
      default:
        console.log('Unknown action:', action, callId);
    }
  }, []);
  
  const handleBulkAction = useCallback(async (action: string) => {
    const selectedIds = Array.from(selectedCalls);
    console.log(`Bulk ${action} on:`, selectedIds);
    
    // Here you would implement the actual bulk operations
    // For now, just clear selection after action
    setSelectedCalls(new Set());
  }, [selectedCalls]);

  const formatDuration = useCallback((seconds: number | undefined) => {
    if (!seconds) return '--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const formatPhoneNumber = useCallback((phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const formatted = cleaned.slice(1);
      return `+1 (${formatted.slice(0,3)}) ${formatted.slice(3,6)}-${formatted.slice(6)}`;
    }
    return phone;
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

  // Memoize visible columns
  const visibleColumns = useMemo(() => columns.filter(col => col.visible), [columns]);
  
  // Row height based on density
  const rowHeight = density === 'compact' ? 48 : 64;
  
  // Virtual row component
  const CallRow = ({ index, style, data }: CallRowProps) => {
    const { calls, selectedCalls, onCallClick, onSelectCall, columns, showHoverActions, onQuickAction } = data;
    const call = calls[index];
    const isSelected = selectedCalls.has(call.id);
    
    if (!call) return null;
    
    return (
      <div 
        style={style} 
        className={cn(
          "flex items-center border-b border-slate-200 hover:bg-slate-50 transition-colors group",
          isSelected && "bg-blue-50 border-blue-200"\n        )}\n        onClick={() => onCallClick(call.id)}\n      >\n        {/* Selection checkbox */}\n        <div className="w-12 px-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>\n          <input\n            type="checkbox"\n            checked={isSelected}\n            onChange={(e) => onSelectCall(call.id, e.target.checked)}\n            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"\n          />\n        </div>\n        \n        {/* Dynamic columns */}\n        {columns.filter(col => col.visible).map(column => {\n          const width = `${column.width}px`;\n          \n          switch (column.id) {\n            case 'time':\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2 text-sm text-slate-900">\n                  <div>{format(new Date(call.startedAt), 'MMM d')}</div>\n                  <div className="text-xs text-slate-500">{format(new Date(call.startedAt), 'h:mm a')}</div>\n                </div>\n              );\n              \n            case 'direction':\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2">\n                  <div className="flex items-center">\n                    <Phone \n                      className={cn(\n                        "h-4 w-4 mr-1",\n                        call.direction === 'in' ? 'text-green-600 rotate-135' : 'text-blue-600'\n                      )} \n                    />\n                    <span className="text-xs text-slate-700">\n                      {call.direction === 'in' ? 'In' : 'Out'}\n                    </span>\n                  </div>\n                </div>\n              );\n              \n            case 'caller':\n              const contact = (call as any).contact;\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2">\n                  <div className="flex items-center space-x-2">\n                    {call.doNotContact && <Ban className="h-3 w-3 text-red-500" />}\n                    <div className="min-w-0">\n                      <div className="text-sm font-medium text-slate-900 truncate">\n                        {contact?.name || 'Unknown'}\n                      </div>\n                      <div className="text-xs text-slate-500 truncate">\n                        {formatPhoneNumber(call.fromE164)}\n                      </div>\n                    </div>\n                  </div>\n                </div>\n              );\n              \n            case 'duration':\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2 text-sm text-slate-900">\n                  {formatDuration(call.durationSec)}\n                </div>\n              );\n              \n            case 'intent':\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2">\n                  {call.intent && (\n                    <span className={cn(\n                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",\n                      getIntentColor(call.intent)\n                    )}>\n                      {call.intent}\n                      {call.intent === 'emergency' && <AlertTriangle className="h-3 w-3 ml-1" />}\n                    </span>\n                  )}\n                </div>\n              );\n              \n            case 'disposition':\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2">\n                  {call.disposition ? (\n                    <span className={cn(\n                      "inline-flex px-2 py-1 text-xs font-semibold rounded-full",\n                      getDispositionColor(call.disposition)\n                    )}>\n                      {call.disposition}\n                    </span>\n                  ) : (\n                    <span className="text-xs text-slate-400">No outcome</span>\n                  )}\n                </div>\n              );\n              \n            case 'agent':\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2 text-sm text-slate-900">\n                  {call.agentType === 'ai' ? 'AI' : 'Human'}\n                </div>\n              );\n              \n            case 'value':\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2 text-sm text-slate-900">\n                  {call.valueEstCents ? `$${(call.valueEstCents / 100).toFixed(0)}` : '--'}\n                </div>\n              );\n              \n            case 'tags':\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2">\n                  <div className="flex flex-wrap gap-1">\n                    {call.tags?.slice(0, 2).map(tag => (\n                      <span key={tag} className="inline-flex px-1 py-0.5 text-xs bg-slate-100 text-slate-700 rounded">\n                        {tag}\n                      </span>\n                    ))}\n                    {(call.tags?.length || 0) > 2 && (\n                      <span className="text-xs text-slate-400">+{call.tags!.length - 2}</span>\n                    )}\n                  </div>\n                </div>\n              );\n              \n            case 'recording':\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2 text-center">\n                  {call.recordingUrl && (\n                    <Play className="h-4 w-4 text-blue-600 mx-auto cursor-pointer hover:text-blue-800" />\n                  )}\n                </div>\n              );\n              \n            case 'followup':\n              const followUpTasks = (call as any).followUpTasks || [];\n              const nextTask = followUpTasks[0];\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2">\n                  {nextTask ? (\n                    <div className="flex items-center space-x-1">\n                      <Clock className="h-3 w-3 text-orange-500" />\n                      <span className="text-xs text-orange-700">\n                        {format(new Date(nextTask.dueAt), 'MMM d')}\n                      </span>\n                    </div>\n                  ) : (\n                    call.outcomeRequired && (\n                      <span className="text-xs text-red-600 font-medium">Required</span>\n                    )\n                  )}\n                </div>\n              );\n              \n            case 'job':\n              const job = (call as any).job;\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2">\n                  {job ? (\n                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">\n                      {job.status}\n                    </span>\n                  ) : (\n                    <span className="text-xs text-slate-400">--</span>\n                  )}\n                </div>\n              );\n              \n            case 'actions':\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2" onClick={(e) => e.stopPropagation()}>\n                  <div className={cn(\n                    "flex items-center space-x-1 transition-opacity",\n                    showHoverActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"\n                  )}>\n                    <button\n                      onClick={() => onQuickAction('call', call.id)}\n                      className="p-1 text-slate-400 hover:text-blue-600 rounded"\n                      title="Call"\n                    >\n                      <Phone className="h-3 w-3" />\n                    </button>\n                    <button\n                      onClick={() => onQuickAction('sms', call.id)}\n                      className="p-1 text-slate-400 hover:text-green-600 rounded"\n                      title="SMS"\n                    >\n                      <MessageSquare className="h-3 w-3" />\n                    </button>\n                    <button\n                      onClick={() => onQuickAction('job', call.id)}\n                      className="p-1 text-slate-400 hover:text-purple-600 rounded"\n                      title="Create Job"\n                    >\n                      <UserPlus className="h-3 w-3" />\n                    </button>\n                  </div>\n                </div>\n              );\n              \n            default:\n              return (\n                <div key={column.id} style={{ width, minWidth: width }} className="px-3 py-2 text-sm text-slate-900">\n                  --\n                </div>\n              );\n          }\n        })}\n      </div>\n    );\n  };\n  \n  if (loading && calls.length === 0) {\n    return (\n      <div className="p-6">\n        <div className="animate-pulse">\n          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>\n          <div className="space-y-3">\n            {[1, 2, 3, 4, 5].map(i => (\n              <div key={i} className="h-4 bg-slate-200 rounded"></div>\n            ))}\n          </div>\n        </div>\n      </div>\n    );\n  }"}, {"old_string": "  return (\n    <div className=\"overflow-hidden\">\n      {/* Bulk Actions */}\n      {selectedCalls.size > 0 && (\n        <div className=\"bg-blue-50 border-b border-blue-200 px-6 py-3\">\n          <div className=\"flex items-center justify-between\">\n            <p className=\"text-sm text-blue-700\">\n              {selectedCalls.size} call{selectedCalls.size > 1 ? 's' : ''} selected\n            </p>\n            <div className=\"flex items-center space-x-2\">\n              <button className=\"px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors\">\n                Mark as spam\n              </button>\n              <button className=\"px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors\">\n                Export CSV\n              </button>\n            </div>\n          </div>\n        </div>\n      )}\n\n      {/* Table */}\n      <div className=\"overflow-x-auto\">\n        <table className=\"w-full divide-y divide-slate-200\">\n          <thead className=\"bg-slate-50\">\n            <tr>\n              <th className=\"w-12 px-6 py-3\">\n                <input\n                  type=\"checkbox\"\n                  checked={selectedCalls.size === calls.length && calls.length > 0}\n                  onChange={(e) => handleSelectAll(e.target.checked)}\n                  className=\"rounded border-slate-300 text-blue-600 focus:ring-blue-500\"\n                />\n              </th>\n              <th \n                className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors\"\n                onClick={() => handleSort('startedAt')}\n              >\n                <div className=\"flex items-center space-x-1\">\n                  <span>Time</span>\n                  <ArrowUpDown className=\"h-4 w-4\" />\n                </div>\n              </th>\n              <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">\n                Direction\n              </th>\n              <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">\n                Contact\n              </th>\n              <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">\n                Duration\n              </th>\n              <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">\n                Intent\n              </th>\n              <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">\n                Disposition\n              </th>\n              <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">\n                Agent\n              </th>\n              <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">\n                Value\n              </th>\n              <th className=\"w-16 px-6 py-3\"></th>\n            </tr>\n          </thead>\n          <tbody className=\"bg-white divide-y divide-slate-200\">\n            {calls.map((call) => (\n              <tr \n                key={call.id} \n                className=\"hover:bg-slate-50 cursor-pointer transition-colors\"\n                onClick={() => onCallClick(call.id)}\n              >\n                <td className=\"px-6 py-4 whitespace-nowrap\" onClick={(e) => e.stopPropagation()}>\n                  <input\n                    type=\"checkbox\"\n                    checked={selectedCalls.has(call.id)}\n                    onChange={(e) => handleSelectCall(call.id, e.target.checked)}\n                    className=\"rounded border-slate-300 text-blue-600 focus:ring-blue-500\"\n                  />\n                </td>\n                <td className=\"px-6 py-4 whitespace-nowrap text-sm text-slate-900\">\n                  {format(new Date(call.startedAt), 'MMM d, h:mm a')}\n                </td>\n                <td className=\"px-6 py-4 whitespace-nowrap\">\n                  <div className=\"flex items-center\">\n                    <Phone \n                      className={cn(\n                        \"h-4 w-4 mr-2\",\n                        call.direction === 'in' ? 'text-green-600 rotate-135' : 'text-blue-600'\n                      )} \n                    />\n                    <span className=\"text-sm text-slate-700\">\n                      {call.direction === 'in' ? 'Inbound' : 'Outbound'}\n                    </span>\n                  </div>\n                </td>\n                <td className=\"px-6 py-4 whitespace-nowrap\">\n                  <div>\n                    <div className=\"text-sm font-medium text-slate-900\">\n                      {(call as any).contact?.name || 'Unknown'}\n                    </div>\n                    <div className=\"text-sm text-slate-500\">\n                      {formatPhoneNumber(call.fromE164)}\n                    </div>\n                  </div>\n                </td>\n                <td className=\"px-6 py-4 whitespace-nowrap text-sm text-slate-900\">\n                  {formatDuration(call.durationSec)}\n                </td>\n                <td className=\"px-6 py-4 whitespace-nowrap\">\n                  {call.intent && (\n                    <span className={cn(\n                      \"inline-flex px-2 py-1 text-xs font-semibold rounded-full\",\n                      getIntentColor(call.intent)\n                    )}>\n                      {call.intent}\n                    </span>\n                  )}\n                </td>\n                <td className=\"px-6 py-4 whitespace-nowrap\">\n                  {call.disposition && (\n                    <span className={cn(\n                      \"inline-flex px-2 py-1 text-xs font-semibold rounded-full\",\n                      getDispositionColor(call.disposition)\n                    )}>\n                      {call.disposition}\n                    </span>\n                  )}\n                </td>\n                <td className=\"px-6 py-4 whitespace-nowrap text-sm text-slate-900\">\n                  {call.agentType === 'ai' ? 'AI' : 'Human'}\n                </td>\n                <td className=\"px-6 py-4 whitespace-nowrap text-sm text-slate-900\">\n                  {call.valueEstCents ? `$${(call.valueEstCents / 100).toFixed(2)}` : '--'}\n                </td>\n                <td className=\"px-6 py-4 whitespace-nowrap text-right text-sm font-medium\">\n                  <button\n                    onClick={(e) => {\n                      e.stopPropagation();\n                      onCallClick(call.id);\n                    }}\n                    className=\"text-blue-600 hover:text-blue-900 transition-colors\"\n                  >\n                    <Eye className=\"h-4 w-4\" />\n                  </button>\n                </td>\n              </tr>\n            ))}\n          </tbody>\n        </table>\n\n        {calls.length === 0 && !loading && (\n          <div className=\"text-center py-12\">\n            <Phone className=\"mx-auto h-12 w-12 text-slate-400\" />\n            <h3 className=\"mt-2 text-sm font-medium text-slate-900\">No calls found</h3>\n            <p className=\"mt-1 text-sm text-slate-500\">\n              There are no calls matching your current filters.\n            </p>\n          </div>\n        )}\n      </div>\n    </div>\n  );", "new_string": "  return (\n    <div className=\"flex flex-col h-full bg-white rounded-lg border\">\n      {/* Table Controls */}\n      <div className=\"flex items-center justify-between px-6 py-4 border-b bg-slate-50\">\n        <div className=\"flex items-center space-x-4\">\n          {/* Triage Mode Toggle */}\n          {onTriageModeChange && (\n            <label className=\"flex items-center space-x-2\">\n              <input\n                type=\"checkbox\"\n                checked={triageMode}\n                onChange={(e) => onTriageModeChange(e.target.checked)}\n                className=\"rounded border-slate-300 text-blue-600 focus:ring-blue-500\"\n              />\n              <span className=\"text-sm font-medium text-slate-700\">Triage Mode</span>\n            </label>\n          )}\n          \n          {/* Density Control */}\n          <div className=\"flex items-center space-x-1 text-sm\">\n            <button\n              onClick={() => setDensity('comfortable')}\n              className={cn(\n                \"px-2 py-1 rounded text-xs transition-colors\",\n                density === 'comfortable' \n                  ? \"bg-blue-100 text-blue-700\" \n                  : \"text-slate-600 hover:bg-slate-100\"\n              )}\n            >\n              Comfortable\n            </button>\n            <button\n              onClick={() => setDensity('compact')}\n              className={cn(\n                \"px-2 py-1 rounded text-xs transition-colors\",\n                density === 'compact' \n                  ? \"bg-blue-100 text-blue-700\" \n                  : \"text-slate-600 hover:bg-slate-100\"\n              )}\n            >\n              Compact\n            </button>\n          </div>\n        </div>\n        \n        <div className=\"flex items-center space-x-2\">\n          {/* Column Manager */}\n          <button\n            onClick={() => setShowColumnManager(!showColumnManager)}\n            className=\"flex items-center space-x-1 px-3 py-1 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50 transition-colors\"\n          >\n            <Settings className=\"h-4 w-4\" />\n            <span>Columns</span>\n            <ChevronDown className=\"h-4 w-4\" />\n          </button>\n          \n          {/* Refresh */}\n          <button\n            onClick={() => loadCalls()}\n            className=\"px-3 py-1 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-50 transition-colors\"\n            disabled={loading}\n          >\n            Refresh\n          </button>\n        </div>\n      </div>\n      \n      {/* Column Manager */}\n      {showColumnManager && (\n        <div className=\"px-6 py-4 border-b bg-slate-50\">\n          <h4 className=\"text-sm font-medium text-slate-900 mb-3\">Manage Columns</h4>\n          <div className=\"grid grid-cols-4 gap-2\">\n            {columns.map(column => (\n              <label key={column.id} className=\"flex items-center space-x-2\">\n                <input\n                  type=\"checkbox\"\n                  checked={column.visible}\n                  onChange={(e) => {\n                    setColumns(prev => prev.map(col => \n                      col.id === column.id ? { ...col, visible: e.target.checked } : col\n                    ));\n                  }}\n                  className=\"rounded border-slate-300 text-blue-600 focus:ring-blue-500\"\n                />\n                <span className=\"text-sm text-slate-700\">{column.label}</span>\n              </label>\n            ))}\n          </div>\n        </div>\n      )}\n\n      {/* Bulk Actions */}\n      {selectedCalls.size > 0 && (\n        <div className=\"bg-blue-50 border-b border-blue-200 px-6 py-3\">\n          <div className=\"flex items-center justify-between\">\n            <p className=\"text-sm text-blue-700 font-medium\">\n              {selectedCalls.size} call{selectedCalls.size > 1 ? 's' : ''} selected\n            </p>\n            <div className=\"flex items-center space-x-2\">\n              <button \n                onClick={() => handleBulkAction('tag')}\n                className=\"flex items-center space-x-1 px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors\"\n              >\n                <Tag className=\"h-3 w-3\" />\n                <span>Add Tags</span>\n              </button>\n              <button \n                onClick={() => handleBulkAction('spam')}\n                className=\"flex items-center space-x-1 px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors\"\n              >\n                <Ban className=\"h-3 w-3\" />\n                <span>Mark Spam</span>\n              </button>\n              <button \n                onClick={() => handleBulkAction('followup')}\n                className=\"flex items-center space-x-1 px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors\"\n              >\n                <Clock className=\"h-3 w-3\" />\n                <span>Schedule Follow-up</span>\n              </button>\n              <button \n                onClick={() => handleBulkAction('export')}\n                className=\"flex items-center space-x-1 px-3 py-1 text-sm text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors\"\n              >\n                <Download className=\"h-3 w-3\" />\n                <span>Export</span>\n              </button>\n            </div>\n          </div>\n        </div>\n      )}\n\n      {/* Table Header */}\n      <div className=\"flex items-center bg-slate-50 border-b sticky top-0 z-10\" style={{ height: '48px' }}>\n        {/* Select All */}\n        <div className=\"w-12 px-4 flex-shrink-0\">\n          <input\n            type=\"checkbox\"\n            checked={selectedCalls.size === calls.length && calls.length > 0}\n            onChange={(e) => handleSelectAll(e.target.checked)}\n            className=\"rounded border-slate-300 text-blue-600 focus:ring-blue-500\"\n          />\n        </div>\n        \n        {/* Column Headers */}\n        {visibleColumns.map(column => (\n          <div \n            key={column.id}\n            style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}\n            className={cn(\n              \"px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\",\n              column.sortable && \"cursor-pointer hover:bg-slate-100 transition-colors\"\n            )}\n            onClick={() => column.sortable && handleSort(column.id as keyof Call)}\n          >\n            <div className=\"flex items-center space-x-1\">\n              <span>{column.label}</span>\n              {column.sortable && <ArrowUpDown className=\"h-3 w-3\" />}\n            </div>\n          </div>\n        ))}\n      </div>\n\n      {/* Virtualized Table Body */}\n      <div className=\"flex-1 overflow-hidden\">\n        {calls.length === 0 && !loading ? (\n          <div className=\"flex flex-col items-center justify-center h-full py-12\">\n            <Phone className=\"h-12 w-12 text-slate-400 mb-4\" />\n            <h3 className=\"text-sm font-medium text-slate-900 mb-2\">No calls found</h3>\n            <p className=\"text-sm text-slate-500 text-center max-w-sm\">\n              {triageMode \n                ? \"No calls require triage at this time.\"\n                : \"There are no calls matching your current filters.\"\n              }\n            </p>\n          </div>\n        ) : (\n          <List\n            ref={listRef}\n            height={400} // This should be dynamic based on container\n            itemCount={calls.length}\n            itemSize={rowHeight}\n            itemData={{\n              calls,\n              selectedCalls,\n              onCallClick,\n              onSelectCall: handleSelectCall,\n              columns: visibleColumns,\n              showHoverActions,\n              onQuickAction: handleQuickAction,\n            }}\n          >\n            {CallRow}\n          </List>\n        )}\n      </div>\n      \n      {/* Load More */}\n      {hasMore && (\n        <div className=\"p-4 border-t\">\n          <button\n            onClick={() => loadCalls(true)}\n            disabled={loading}\n            className=\"w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors disabled:opacity-50\"\n          >\n            {loading ? 'Loading...' : 'Load More Calls'}\n          </button>\n        </div>\n      )}\n    </div>\n  );"}, {"old_string": "}", "new_string": "}\n\n// Export types for other components\nexport type { CallsFilters, SavedView, Column };"}]

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