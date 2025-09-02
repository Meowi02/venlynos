"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/DataTable';
import { 
  Search, 
  FileText, 
  Filter,
  Download,
  Eye,
  User,
  Settings,
  Phone,
  Calendar,
  MessageSquare,
  Shield,
  Database,
  AlertTriangle
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  actor_type: 'user' | 'system' | 'api';
  actor_id?: string;
  actor_name?: string;
  action: string;
  resource_type: 'user' | 'job' | 'call' | 'number' | 'setting' | 'sop' | 'workspace';
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  workspace_id: string;
}

// Mock audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: 'log1',
    timestamp: '2024-01-15T10:30:00Z',
    actor_type: 'user',
    actor_id: 'u1',
    actor_name: 'Sarah Johnson',
    action: 'user.login',
    resource_type: 'user',
    resource_id: 'u1',
    details: { success: true, method: '2fa' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    severity: 'info',
    workspace_id: 'ws1'
  },
  {
    id: 'log2',
    timestamp: '2024-01-15T10:25:00Z',
    actor_type: 'user',
    actor_id: 'u2',
    actor_name: 'Mike Chen',
    action: 'job.status_update',
    resource_type: 'job',
    resource_id: 'j1',
    details: { 
      old_status: 'scheduled', 
      new_status: 'en_route',
      job_title: 'HVAC System Repair'
    },
    ip_address: '10.0.0.50',
    severity: 'info',
    workspace_id: 'ws1'
  },
  {
    id: 'log3',
    timestamp: '2024-01-15T10:20:00Z',
    actor_type: 'system',
    action: 'call.completed',
    resource_type: 'call',
    resource_id: 'c1',
    details: {
      duration_seconds: 245,
      disposition: 'answered',
      intent: 'emergency',
      caller_id: '+15551234567'
    },
    severity: 'info',
    workspace_id: 'ws1'
  },
  {
    id: 'log4',
    timestamp: '2024-01-15T10:15:00Z',
    actor_type: 'user',
    actor_id: 'u1',
    actor_name: 'Sarah Johnson',
    action: 'settings.update',
    resource_type: 'setting',
    details: {
      setting: 'business_hours',
      old_value: { monday: { open: '08:00', close: '17:00' } },
      new_value: { monday: { open: '09:00', close: '18:00' } }
    },
    ip_address: '192.168.1.100',
    severity: 'info',
    workspace_id: 'ws1'
  },
  {
    id: 'log5',
    timestamp: '2024-01-15T10:10:00Z',
    actor_type: 'system',
    action: 'number.suspended',
    resource_type: 'number',
    resource_id: 'n3',
    details: {
      reason: 'budget_exceeded',
      budget_cap: 1000,
      current_usage: 1050,
      phone_number: '+15555555555'
    },
    severity: 'warning',
    workspace_id: 'ws1'
  },
  {
    id: 'log6',
    timestamp: '2024-01-15T10:05:00Z',
    actor_type: 'user',
    actor_id: 'u3',
    actor_name: 'Lisa Wong',
    action: 'user.failed_login',
    resource_type: 'user',
    resource_id: 'u5',
    details: {
      reason: 'invalid_password',
      attempt_count: 3,
      account_locked: false
    },
    ip_address: '203.0.113.1',
    severity: 'warning',
    workspace_id: 'ws1'
  },
  {
    id: 'log7',
    timestamp: '2024-01-15T10:00:00Z',
    actor_type: 'api',
    action: 'data.export',
    resource_type: 'workspace',
    details: {
      export_type: 'calls',
      date_range: '2024-01-01 to 2024-01-14',
      record_count: 1247,
      api_key_id: 'ak_12345'
    },
    ip_address: '198.51.100.42',
    severity: 'info',
    workspace_id: 'ws1'
  },
  {
    id: 'log8',
    timestamp: '2024-01-15T09:55:00Z',
    actor_type: 'system',
    action: 'backup.failed',
    resource_type: 'workspace',
    details: {
      backup_type: 'daily',
      error: 'insufficient_storage',
      storage_used_gb: 95.2,
      storage_limit_gb: 100
    },
    severity: 'error',
    workspace_id: 'ws1'
  }
];

const actionIcons: Record<string, JSX.Element> = {
  'user.login': <User className="w-4 h-4 text-green-500" />,
  'user.logout': <User className="w-4 h-4 text-gray-500" />,
  'user.failed_login': <User className="w-4 h-4 text-red-500" />,
  'job.status_update': <Calendar className="w-4 h-4 text-blue-500" />,
  'call.completed': <Phone className="w-4 h-4 text-green-500" />,
  'call.failed': <Phone className="w-4 h-4 text-red-500" />,
  'settings.update': <Settings className="w-4 h-4 text-blue-500" />,
  'number.suspended': <Phone className="w-4 h-4 text-yellow-500" />,
  'sop.published': <FileText className="w-4 h-4 text-green-500" />,
  'data.export': <Download className="w-4 h-4 text-blue-500" />,
  'backup.failed': <Database className="w-4 h-4 text-red-500" />
};

const severityColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  critical: 'bg-purple-100 text-purple-800'
};

const resourceTypeColors: Record<string, string> = {
  user: 'bg-green-100 text-green-800',
  job: 'bg-blue-100 text-blue-800',
  call: 'bg-purple-100 text-purple-800',
  number: 'bg-orange-100 text-orange-800',
  setting: 'bg-gray-100 text-gray-800',
  sop: 'bg-teal-100 text-teal-800',
  workspace: 'bg-indigo-100 text-indigo-800'
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [selectedActor, setSelectedActor] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('today');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchLower) ||
        (log.actor_name && log.actor_name.toLowerCase().includes(searchLower)) ||
        JSON.stringify(log.details).toLowerCase().includes(searchLower)
      );
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === selectedSeverity);
    }

    // Filter by resource type
    if (selectedResource !== 'all') {
      filtered = filtered.filter(log => log.resource_type === selectedResource);
    }

    // Filter by actor type
    if (selectedActor !== 'all') {
      filtered = filtered.filter(log => log.actor_type === selectedActor);
    }

    // Filter by date range (mock implementation)
    const now = new Date();
    if (dateRange === 'today') {
      const today = now.toISOString().split('T')[0];
      if (today) {
        filtered = filtered.filter(log => log.timestamp.startsWith(today));
      }
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => new Date(log.timestamp) > weekAgo);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, selectedSeverity, selectedResource, selectedActor, dateRange]);

  const exportLogs = () => {
    const csv = [
      'Timestamp,Actor,Action,Resource,Severity,Details',
      ...filteredLogs.map(log => 
        `${log.timestamp},${log.actor_name || log.actor_type},${log.action},${log.resource_type},${log.severity},"${JSON.stringify(log.details).replace(/"/g, '""')}"`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      cell: ({ row }: { row: { original: AuditLog } }) => (
        <div>
          <div className="text-sm">
            {new Date(row.original.timestamp).toLocaleDateString()}
          </div>
          <div className="text-xs text-text-secondary">
            {new Date(row.original.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: ({ row }: { row: { original: AuditLog } }) => (
        <div className="flex items-center gap-2">
          {actionIcons[row.original.action] || <FileText className="w-4 h-4 text-gray-500" />}
          <span className="font-mono text-sm">{row.original.action}</span>
        </div>
      )
    },
    {
      header: 'Actor',
      accessorKey: 'actor_name',
      cell: ({ row }: { row: { original: AuditLog } }) => (
        <div>
          {row.original.actor_name ? (
            <div>
              <div className="font-medium text-sm">{row.original.actor_name}</div>
              <div className="text-xs text-text-secondary capitalize">{row.original.actor_type}</div>
            </div>
          ) : (
            <div className="text-sm capitalize">{row.original.actor_type}</div>
          )}
        </div>
      )
    },
    {
      header: 'Resource',
      accessorKey: 'resource_type',
      cell: ({ row }: { row: { original: AuditLog } }) => (
        <Badge className={`capitalize ${resourceTypeColors[row.original.resource_type]}`}>
          {row.original.resource_type}
        </Badge>
      )
    },
    {
      header: 'Severity',
      accessorKey: 'severity',
      cell: ({ row }: { row: { original: AuditLog } }) => (
        <Badge className={`capitalize ${severityColors[row.original.severity]}`}>
          {row.original.severity}
        </Badge>
      )
    },
    {
      header: 'Details',
      accessorKey: 'details',
      cell: ({ row }: { row: { original: AuditLog } }) => (
        <div className="max-w-xs">
          <div className="text-sm text-text-secondary truncate">
            {Object.entries(row.original.details).slice(0, 2).map(([key, value]) => 
              `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
            ).join(', ')}
          </div>
        </div>
      )
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: { original: AuditLog } }) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSelectedLog(row.original)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Audit Log</h1>
            <p className="text-text-secondary mt-1">
              Monitor system activity and user actions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Retention Policy
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="venlyn-card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              placeholder="Search actions, users, or details..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="all">All time</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Resources</option>
            <option value="user">Users</option>
            <option value="job">Jobs</option>
            <option value="call">Calls</option>
            <option value="number">Numbers</option>
            <option value="setting">Settings</option>
            <option value="sop">SOPs</option>
            <option value="workspace">Workspace</option>
          </select>

          <select
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Actors</option>
            <option value="user">Users</option>
            <option value="system">System</option>
            <option value="api">API</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="venlyn-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Total Events</div>
              <div className="text-xl font-semibold">{filteredLogs.length}</div>
            </div>
          </div>
        </div>

        <div className="venlyn-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Errors</div>
              <div className="text-xl font-semibold">
                {filteredLogs.filter(log => log.severity === 'error' || log.severity === 'critical').length}
              </div>
            </div>
          </div>
        </div>

        <div className="venlyn-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Security Events</div>
              <div className="text-xl font-semibold">
                {filteredLogs.filter(log => 
                  log.action.includes('login') || log.action.includes('auth') || log.action.includes('permission')
                ).length}
              </div>
            </div>
          </div>
        </div>

        <div className="venlyn-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Active Users</div>
              <div className="text-xl font-semibold">
                {new Set(filteredLogs.filter(log => log.actor_type === 'user').map(log => log.actor_id)).size}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Showing {filteredLogs.length} of {logs.length} events
        </p>
        
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>{filteredLogs.filter(l => l.severity === 'info').length} Info</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>{filteredLogs.filter(l => l.severity === 'warning').length} Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>{filteredLogs.filter(l => l.severity === 'error').length} Error</span>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="venlyn-card p-0">
        <DataTable
          columns={columns}
          data={filteredLogs}
          onRowClick={(log) => setSelectedLog(log as AuditLog)}
        />
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {actionIcons[selectedLog.action] || <FileText className="w-5 h-5 text-gray-500" />}
                  <h2 className="text-xl font-semibold">Audit Log Detail</h2>
                </div>
                <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Timestamp</label>
                    <div className="text-sm">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Action</label>
                    <div className="text-sm font-mono">{selectedLog.action}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Actor</label>
                    <div className="text-sm">
                      {selectedLog.actor_name || selectedLog.actor_type}
                      {selectedLog.actor_name && (
                        <span className="text-text-secondary"> ({selectedLog.actor_type})</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Resource</label>
                    <div className="flex items-center gap-2">
                      <Badge className={`capitalize ${resourceTypeColors[selectedLog.resource_type]}`}>
                        {selectedLog.resource_type}
                      </Badge>
                      {selectedLog.resource_id && (
                        <span className="text-sm font-mono">{selectedLog.resource_id}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="text-sm font-medium text-text-secondary">Severity</label>
                  <div className="mt-1">
                    <Badge className={`capitalize ${severityColors[selectedLog.severity]}`}>
                      {selectedLog.severity}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <label className="text-sm font-medium text-text-secondary">Details</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Network Info */}
                {(selectedLog.ip_address || selectedLog.user_agent) && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Network Information</h3>
                    {selectedLog.ip_address && (
                      <div>
                        <label className="text-sm font-medium text-text-secondary">IP Address</label>
                        <div className="text-sm font-mono">{selectedLog.ip_address}</div>
                      </div>
                    )}
                    {selectedLog.user_agent && (
                      <div>
                        <label className="text-sm font-medium text-text-secondary">User Agent</label>
                        <div className="text-sm break-all">{selectedLog.user_agent}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-6 mt-6 border-t">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                  alert('Log copied to clipboard');
                }}>
                  Copy JSON
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}