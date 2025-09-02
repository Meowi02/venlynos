"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  Slack,
  Zap,
  Cloud,
  Key,
  Webhook,
  Database,
  CreditCard,
  Globe,
  Users
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'calendar' | 'communication' | 'crm' | 'payment' | 'automation' | 'analytics';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: JSX.Element;
  provider: string;
  config?: Record<string, any>;
  connected_at?: string;
  last_sync?: string;
  features: string[];
}

// Mock integrations data
const mockIntegrations: Integration[] = [
  {
    id: 'google-cal',
    name: 'Google Calendar',
    description: 'Sync job appointments with your Google Calendar',
    category: 'calendar',
    status: 'connected',
    icon: <Calendar className="w-6 h-6 text-blue-600" />,
    provider: 'Google',
    config: {
      calendar_id: 'plumbco.operations@gmail.com',
      sync_direction: 'bidirectional'
    },
    connected_at: '2024-01-01T00:00:00Z',
    last_sync: '2024-01-15T10:30:00Z',
    features: ['Two-way sync', 'Automatic reminders', 'Team calendars']
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Voice and SMS communications platform',
    category: 'communication',
    status: 'connected',
    icon: <Phone className="w-6 h-6 text-red-600" />,
    provider: 'Twilio',
    config: {
      account_sid: 'AC1234567890',
      numbers_count: 3
    },
    connected_at: '2024-01-01T00:00:00Z',
    last_sync: '2024-01-15T10:25:00Z',
    features: ['Voice calls', 'SMS messaging', 'Call recording']
  },
  {
    id: 'outlook-cal',
    name: 'Outlook Calendar',
    description: 'Microsoft Outlook calendar integration',
    category: 'calendar',
    status: 'disconnected',
    icon: <Calendar className="w-6 h-6 text-blue-500" />,
    provider: 'Microsoft',
    features: ['Calendar sync', 'Meeting scheduling', 'Team availability']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    category: 'communication',
    status: 'pending',
    icon: <Slack className="w-6 h-6 text-purple-600" />,
    provider: 'Slack',
    features: ['Real-time notifications', 'Team alerts', 'Custom channels']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and invoicing',
    category: 'payment',
    status: 'error',
    icon: <CreditCard className="w-6 h-6 text-indigo-600" />,
    provider: 'Stripe',
    features: ['Payment processing', 'Subscription billing', 'Invoice generation']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Workflow automation platform',
    category: 'automation',
    status: 'disconnected',
    icon: <Zap className="w-6 h-6 text-orange-500" />,
    provider: 'Zapier',
    features: ['Workflow automation', '3000+ app connections', 'Custom triggers']
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and financial management',
    category: 'analytics',
    status: 'disconnected',
    icon: <Database className="w-6 h-6 text-green-600" />,
    provider: 'Intuit',
    features: ['Financial sync', 'Invoice tracking', 'Expense management']
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email integration for notifications',
    category: 'communication',
    status: 'connected',
    icon: <Mail className="w-6 h-6 text-red-500" />,
    provider: 'Google',
    config: {
      email: 'support@plumbco.com'
    },
    connected_at: '2024-01-01T00:00:00Z',
    features: ['Email notifications', 'Automated responses', 'Template management']
  }
];

const categoryIcons: Record<string, JSX.Element> = {
  calendar: <Calendar className="w-5 h-5" />,
  communication: <MessageSquare className="w-5 h-5" />,
  crm: <Users className="w-5 h-5" />,
  payment: <CreditCard className="w-5 h-5" />,
  automation: <Zap className="w-5 h-5" />,
  analytics: <Database className="w-5 h-5" />
};

const statusColors: Record<string, string> = {
  connected: 'bg-green-100 text-green-800',
  disconnected: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800'
};

const statusIcons: Record<string, JSX.Element> = {
  connected: <CheckCircle className="w-4 h-4 text-green-500" />,
  disconnected: <AlertCircle className="w-4 h-4 text-gray-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-500" />,
  pending: <AlertCircle className="w-4 h-4 text-yellow-500" />
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [webhookConfigOpen, setWebhookConfigOpen] = useState(false);

  const filteredIntegrations = integrations.filter(integration =>
    selectedCategory === 'all' || integration.category === selectedCategory
  );

  const categories = [
    { id: 'all', label: 'All', count: integrations.length },
    { id: 'calendar', label: 'Calendar', count: integrations.filter(i => i.category === 'calendar').length },
    { id: 'communication', label: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { id: 'payment', label: 'Payment', count: integrations.filter(i => i.category === 'payment').length },
    { id: 'automation', label: 'Automation', count: integrations.filter(i => i.category === 'automation').length },
    { id: 'analytics', label: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length }
  ];

  const handleConnect = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { 
            ...integration, 
            status: 'connected',
            connected_at: new Date().toISOString(),
            last_sync: new Date().toISOString()
          }
        : integration
    ));
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { 
            ...integration, 
            status: 'disconnected',
            connected_at: undefined,
            last_sync: undefined
          }
        : integration
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Integrations</h1>
            <p className="text-text-secondary mt-1">
              Connect your favorite tools and services
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={webhookConfigOpen} onOpenChange={setWebhookConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Webhook className="w-4 h-4 mr-2" />
                Webhooks
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Webhook Configuration</DialogTitle>
                <DialogDescription>
                  Configure webhooks to receive real-time updates from Venlyn Ops.
                </DialogDescription>
              </DialogHeader>
              <WebhookConfig onClose={() => setWebhookConfigOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </Button>
        </div>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="venlyn-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Total Integrations</div>
              <div className="text-xl font-semibold">{integrations.length}</div>
            </div>
          </div>
        </div>

        <div className="venlyn-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Connected</div>
              <div className="text-xl font-semibold">
                {integrations.filter(i => i.status === 'connected').length}
              </div>
            </div>
          </div>
        </div>

        <div className="venlyn-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Pending</div>
              <div className="text-xl font-semibold">
                {integrations.filter(i => i.status === 'pending').length}
              </div>
            </div>
          </div>
        </div>

        <div className="venlyn-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-text-secondary">Errors</div>
              <div className="text-xl font-semibold">
                {integrations.filter(i => i.status === 'error').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="venlyn-card">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
              }`}
            >
              {category.id !== 'all' && categoryIcons[category.id]}
              <span>{category.label}</span>
              <Badge variant="outline" className="text-xs">
                {category.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onConfigure={(integration) => {
              setSelectedIntegration(integration);
              setConfigOpen(true);
            }}
          />
        ))}
      </div>

      {/* Integration Configuration Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Configure {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Manage settings and preferences for this integration.
            </DialogDescription>
          </DialogHeader>
          {selectedIntegration && (
            <IntegrationConfig 
              integration={selectedIntegration}
              onClose={() => setConfigOpen(false)}
              onSave={(config) => {
                setIntegrations(integrations.map(i =>
                  i.id === selectedIntegration.id ? { ...i, config } : i
                ));
                setConfigOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onConfigure: (integration: Integration) => void;
}

function IntegrationCard({ integration, onConnect, onDisconnect, onConfigure }: IntegrationCardProps) {
  return (
    <div className="venlyn-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {integration.icon}
          <div>
            <h3 className="font-semibold text-text-primary">{integration.name}</h3>
            <p className="text-sm text-text-secondary">{integration.provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusIcons[integration.status]}
          <Badge className={statusColors[integration.status]}>
            {integration.status}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-text-secondary mb-4">{integration.description}</p>

      <div className="space-y-3 mb-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Features</h4>
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 3).map(feature => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {integration.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{integration.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {integration.status === 'connected' && integration.last_sync && (
          <div className="text-xs text-text-secondary">
            Last sync: {new Date(integration.last_sync).toLocaleString()}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {integration.status === 'connected' ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConfigure(integration)}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-1" />
              Configure
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDisconnect(integration.id)}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={() => onConnect(integration.id)}
            className="flex-1"
            disabled={integration.status === 'pending'}
          >
            {integration.status === 'pending' ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </div>
    </div>
  );
}

interface IntegrationConfigProps {
  integration: Integration;
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
}

function IntegrationConfig({ integration, onClose, onSave }: IntegrationConfigProps) {
  const [config, setConfig] = useState(integration.config || {});

  const handleSave = () => {
    onSave(config);
  };

  if (integration.id === 'google-cal') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Calendar ID</label>
          <Input
            value={config.calendar_id || ''}
            onChange={(e) => setConfig({ ...config, calendar_id: e.target.value })}
            placeholder="your-calendar@gmail.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Sync Direction</label>
          <select 
            value={config.sync_direction || 'bidirectional'}
            onChange={(e) => setConfig({ ...config, sync_direction: e.target.value })}
            className="w-full p-2 border border-gray-200 rounded-lg"
          >
            <option value="bidirectional">Two-way sync</option>
            <option value="to_calendar">Venlyn → Calendar only</option>
            <option value="from_calendar">Calendar → Venlyn only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Default Event Duration</label>
          <Input
            type="number"
            value={config.default_duration || 60}
            onChange={(e) => setConfig({ ...config, default_duration: parseInt(e.target.value) })}
            placeholder="60"
          />
          <p className="text-xs text-text-secondary mt-1">Duration in minutes</p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </div>
    );
  }

  if (integration.id === 'slack') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Default Channel</label>
          <Input
            value={config.default_channel || ''}
            onChange={(e) => setConfig({ ...config, default_channel: e.target.value })}
            placeholder="#general"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3">Notification Types</label>
          <div className="space-y-2">
            {['Emergency Calls', 'Job Updates', 'System Alerts', 'Daily Reports'].map(type => (
              <label key={type} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </div>
    );
  }

  // Generic configuration
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Configuration options for {integration.name} will be available here once connected.
        </p>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

function WebhookConfig({ onClose }: { onClose: () => void }) {
  const [webhooks, setWebhooks] = useState([
    {
      id: '1',
      url: 'https://api.yourapp.com/webhooks/venlyn',
      events: ['call.completed', 'job.updated'],
      status: 'active'
    }
  ]);

  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] as string[] });

  const availableEvents = [
    'call.started',
    'call.completed',
    'call.failed',
    'job.created',
    'job.updated',
    'job.completed',
    'user.login',
    'system.alert'
  ];

  const addWebhook = () => {
    if (newWebhook.url && newWebhook.events.length > 0) {
      setWebhooks([...webhooks, {
        id: Date.now().toString(),
        ...newWebhook,
        status: 'active'
      }]);
      setNewWebhook({ url: '', events: [] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Webhooks */}
      <div>
        <h3 className="font-medium mb-3">Configured Webhooks</h3>
        <div className="space-y-3">
          {webhooks.map(webhook => (
            <div key={webhook.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-sm">{webhook.url}</div>
                <Badge className={webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {webhook.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {webhook.events.map(event => (
                  <Badge key={event} variant="outline" className="text-xs">
                    {event}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Webhook */}
      <div>
        <h3 className="font-medium mb-3">Add New Webhook</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Webhook URL</label>
            <Input
              value={newWebhook.url}
              onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
              placeholder="https://your-app.com/webhook"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Events</label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map(event => (
                <label key={event} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={newWebhook.events.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewWebhook({
                          ...newWebhook,
                          events: [...newWebhook.events, event]
                        });
                      } else {
                        setNewWebhook({
                          ...newWebhook,
                          events: newWebhook.events.filter(e => e !== event)
                        });
                      }
                    }}
                  />
                  <span className="text-sm font-mono">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <Button onClick={addWebhook} disabled={!newWebhook.url || newWebhook.events.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Add Webhook
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}