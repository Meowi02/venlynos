"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Settings, 
  Clock, 
  AlertTriangle, 
  Phone, 
  DollarSign, 
  FileText, 
  Bell,
  Building,
  Map,
  Save,
  CheckCircle,
  Upload,
  Plus,
  Trash2
} from 'lucide-react';

interface BusinessHours {
  day: string;
  enabled: boolean;
  open: string;
  close: string;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  recurring: boolean;
}

interface NotificationSettings {
  emergencies: boolean;
  missed_calls: boolean;
  job_updates: boolean;
  system_alerts: boolean;
  daily_digest: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
}

// Mock data
const initialBusinessHours: BusinessHours[] = [
  { day: 'Monday', enabled: true, open: '08:00', close: '17:00' },
  { day: 'Tuesday', enabled: true, open: '08:00', close: '17:00' },
  { day: 'Wednesday', enabled: true, open: '08:00', close: '17:00' },
  { day: 'Thursday', enabled: true, open: '08:00', close: '17:00' },
  { day: 'Friday', enabled: true, open: '08:00', close: '17:00' },
  { day: 'Saturday', enabled: true, open: '09:00', close: '15:00' },
  { day: 'Sunday', enabled: false, open: '09:00', close: '15:00' },
];

const initialHolidays: Holiday[] = [
  { id: '1', name: 'Christmas Day', date: '2024-12-25', recurring: true },
  { id: '2', name: 'New Year\'s Day', date: '2024-01-01', recurring: true },
  { id: '3', name: 'Thanksgiving', date: '2024-11-28', recurring: true },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [businessHours, setBusinessHours] = useState(initialBusinessHours);
  const [holidays, setHolidays] = useState(initialHolidays);
  const [escalationTarget, setEscalationTarget] = useState('support@plumbco.com');
  const [escalationPhone, setEscalationPhone] = useState('+15551234567');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [overflowEnabled, setOverflowEnabled] = useState(false);
  const [overflowTargets, setOverflowTargets] = useState(['+15559876543']);
  const [budgetCap, setBudgetCap] = useState(5000);
  const [alertThreshold, setAlertThreshold] = useState(4000);
  const [retentionDays, setRetentionDays] = useState(30);
  const [transcriptRedaction, setTranscriptRedaction] = useState(true);
  const [workspaceName, setWorkspaceName] = useState('PlumbCo Operations');
  const [timezone, setTimezone] = useState('America/New_York');
  const [serviceAreas, setServiceAreas] = useState(['Downtown', 'Suburbs', 'Industrial District']);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emergencies: true,
    missed_calls: true,
    job_updates: false,
    system_alerts: true,
    daily_digest: true,
    email: true,
    sms: false,
    push: true
  });

  const saveSettings = () => {
    // Simulate save
    alert('Settings saved successfully!');
  };

  const updateBusinessHour = (index: number, field: keyof BusinessHours, value: any) => {
    const updated = [...businessHours];
    const current = updated[index];
    if (current) {
      updated[index] = { ...current, [field]: value };
      setBusinessHours(updated);
    }
  };

  const addHoliday = () => {
    const dateString = new Date().toISOString().split('T')[0];
    const newHoliday: Holiday = {
      id: Date.now().toString(),
      name: 'New Holiday',
      date: dateString || '',
      recurring: false
    };
    setHolidays([...holidays, newHoliday]);
  };

  const removeHoliday = (id: string) => {
    setHolidays(holidays.filter(h => h.id !== id));
  };

  const updateHoliday = (id: string, field: keyof Holiday, value: any) => {
    setHolidays(holidays.map(h => 
      h.id === id ? { ...h, [field]: value } : h
    ));
  };

  const addOverflowTarget = () => {
    setOverflowTargets([...overflowTargets, '']);
  };

  const updateOverflowTarget = (index: number, value: string) => {
    const updated = [...overflowTargets];
    updated[index] = value;
    setOverflowTargets(updated);
  };

  const removeOverflowTarget = (index: number) => {
    setOverflowTargets(overflowTargets.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Settings className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-secondary mt-1">
              Configure your workspace and operational preferences
            </p>
          </div>
        </div>
        <Button onClick={saveSettings}>
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <div className="venlyn-card p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 px-6">
            <TabsList className="bg-transparent">
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="escalation">Escalation</TabsTrigger>
              <TabsTrigger value="overflow">Overflow</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="retention">Retention</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="business" className="mt-0 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-text-secondary" />
                  <h3 className="text-lg font-semibold">Business Hours</h3>
                </div>
                
                <div className="space-y-3">
                  {businessHours.map((hour, index) => (
                    <div key={hour.day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-24">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hour.enabled}
                            onChange={(e) => updateBusinessHour(index, 'enabled', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="font-medium">{hour.day}</span>
                        </label>
                      </div>
                      
                      {hour.enabled ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hour.open}
                            onChange={(e) => updateBusinessHour(index, 'open', e.target.value)}
                            className="w-32"
                          />
                          <span className="text-text-secondary">to</span>
                          <Input
                            type="time"
                            value={hour.close}
                            onChange={(e) => updateBusinessHour(index, 'close', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      ) : (
                        <span className="text-text-tertiary">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Holidays</h3>
                  <Button size="sm" onClick={addHoliday}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holiday
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {holidays.map((holiday) => (
                    <div key={holiday.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                      <Input
                        value={holiday.name}
                        onChange={(e) => updateHoliday(holiday.id, 'name', e.target.value)}
                        className="flex-1"
                        placeholder="Holiday name"
                      />
                      <Input
                        type="date"
                        value={holiday.date}
                        onChange={(e) => updateHoliday(holiday.id, 'date', e.target.value)}
                        className="w-40"
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={holiday.recurring}
                          onChange={(e) => updateHoliday(holiday.id, 'recurring', e.target.checked)}
                        />
                        <span className="text-sm">Annual</span>
                      </label>
                      <Button size="sm" variant="ghost" onClick={() => removeHoliday(holiday.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="escalation" className="mt-0 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold">Escalation Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    value={escalationTarget}
                    onChange={(e) => setEscalationTarget(e.target.value)}
                    placeholder="support@yourcompany.com"
                  />
                  <p className="text-sm text-text-secondary mt-1">
                    Primary email for escalation notifications
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    value={escalationPhone}
                    onChange={(e) => setEscalationPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                  <p className="text-sm text-text-secondary mt-1">
                    SMS notifications for urgent escalations
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Slack Webhook URL</label>
                  <Input
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                  <p className="text-sm text-text-secondary mt-1">
                    Send escalation alerts to your Slack channel
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Escalation Triggers</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Escalations are automatically triggered by emergency keywords, low AI confidence, or extended call duration. Configure these rules in the Jarvis Agent Studio.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="overflow" className="mt-0 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold">Overflow Settings</h3>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={overflowEnabled}
                    onChange={(e) => setOverflowEnabled(e.target.checked)}
                  />
                  <span className="font-medium">Enable call overflow</span>
                </label>

                {overflowEnabled && (
                  <div className="space-y-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ring Strategy</label>
                      <select className="w-full p-2 border border-gray-200 rounded-lg">
                        <option value="sequential">Sequential (one by one)</option>
                        <option value="simultaneous">Simultaneous (all at once)</option>
                        <option value="round_robin">Round Robin</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Overflow Targets</label>
                        <Button size="sm" onClick={addOverflowTarget}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Number
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {overflowTargets.map((target, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={target}
                              onChange={(e) => updateOverflowTarget(index, e.target.value)}
                              placeholder="+1 (555) 123-4567"
                              className="flex-1"
                            />
                            {overflowTargets.length > 1 && (
                              <Button size="sm" variant="ghost" onClick={() => removeOverflowTarget(index)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Timeout (seconds)</label>
                        <Input type="number" defaultValue="30" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Max Attempts</label>
                        <Input type="number" defaultValue="3" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="budget" className="mt-0 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold">Budget Management</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Budget Cap</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                    <Input
                      type="number"
                      value={budgetCap}
                      onChange={(e) => setBudgetCap(Number(e.target.value))}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Hard limit for monthly call costs
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Alert Threshold</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">$</span>
                    <Input
                      type="number"
                      value={alertThreshold}
                      onChange={(e) => setAlertThreshold(Number(e.target.value))}
                      className="pl-8"
                    />
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Send alerts when reaching this amount
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="font-medium">$2,847 / ${budgetCap}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(2847 / budgetCap) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-blue-700">
                    <span>{Math.round((2847 / budgetCap) * 100)}% used</span>
                    <span>${budgetCap - 2847} remaining</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Budget Actions</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Auto-disable numbers when budget is exceeded</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Send daily usage reports</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">Require approval for emergency overrides</span>
                  </label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="retention" className="mt-0 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold">Data Retention</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Call Recording Retention</label>
                  <select 
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                    <option value={-1}>Keep forever</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Transcript Retention</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg">
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                    <option value={1095}>3 years</option>
                    <option value={-1}>Keep forever</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Privacy & Redaction</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={transcriptRedaction}
                      onChange={(e) => setTranscriptRedaction(e.target.checked)}
                    />
                    <span className="text-sm">Auto-redact PII in transcripts</span>
                  </label>
                  <div className="pl-6 text-sm text-text-secondary">
                    Automatically mask phone numbers, emails, and credit card numbers
                  </div>
                  
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Require admin approval to view unredacted transcripts</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Compliance Note</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Ensure your retention policies comply with local regulations and industry standards. Some jurisdictions require longer retention periods for telecommunications records.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Event Types</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'emergencies', label: 'Emergency calls', description: 'High-priority calls requiring immediate attention' },
                      { key: 'missed_calls', label: 'Missed calls', description: 'Calls that went unanswered or to voicemail' },
                      { key: 'job_updates', label: 'Job status changes', description: 'Updates on job completion and status changes' },
                      { key: 'system_alerts', label: 'System alerts', description: 'Technical issues and service disruptions' },
                      { key: 'daily_digest', label: 'Daily summary', description: 'End-of-day performance and activity summary' }
                    ].map(({ key, label, description }) => (
                      <label key={key} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          checked={notifications[key as keyof NotificationSettings]}
                          onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{label}</div>
                          <div className="text-xs text-text-secondary mt-1">{description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Delivery Methods</h4>
                  <div className="flex gap-4">
                    {[
                      { key: 'email', label: 'Email', icon: '✉️' },
                      { key: 'sms', label: 'SMS', icon: '💬' },
                      { key: 'push', label: 'Push', icon: '🔔' }
                    ].map(({ key, label, icon }) => (
                      <label key={key} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          checked={notifications[key as keyof NotificationSettings]}
                          onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                        />
                        <span className="text-lg">{icon}</span>
                        <span className="text-sm font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workspace" className="mt-0 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold">Workspace Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Workspace Name</label>
                  <Input
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    <label className="block text-sm font-medium">Service Areas</label>
                  </div>
                  <Button size="sm" onClick={() => setServiceAreas([...serviceAreas, 'New Area'])}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Area
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {serviceAreas.map((area, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={area}
                        onChange={(e) => {
                          const updated = [...serviceAreas];
                          updated[index] = e.target.value;
                          setServiceAreas(updated);
                        }}
                        className="flex-1"
                      />
                      {serviceAreas.length > 1 && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setServiceAreas(serviceAreas.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  Define geographic areas for technician routing and scheduling
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Service Area Polygons (GeoJSON)</label>
                <div className="border border-gray-200 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-text-tertiary" />
                  <p className="text-sm text-text-secondary mb-3">
                    Upload GeoJSON file to define precise service boundaries
                  </p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}