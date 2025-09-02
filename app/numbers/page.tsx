"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DataTable from '@/components/DataTable';
import { 
  Plus, 
  Phone, 
  Settings, 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  DollarSign,
  MessageSquare,
  Shield
} from 'lucide-react';

interface PhoneNumber {
  id: string;
  e164: string;
  label: string;
  status: 'active' | 'suspended';
  routing_mode: 'ai' | 'human' | 'overflow';
  after_hours: 'ai' | 'vm' | 'forward';
  recording_opt_in: boolean;
  minute_budget_cap?: number;
  a2p_brand_status?: 'none' | 'submitted' | 'approved' | 'rejected';
  a2p_campaign_status?: 'none' | 'submitted' | 'approved' | 'rejected' | 'suspended';
  monthly_cost: number;
  created_at: string;
}

// Mock data
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'suspended': return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'submitted': return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
    default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
};

const mockNumbers: PhoneNumber[] = [
  {
    id: 'n1',
    e164: '+15551234567',
    label: 'Main Line',
    status: 'active',
    routing_mode: 'ai',
    after_hours: 'ai',
    recording_opt_in: true,
    minute_budget_cap: 1000,
    a2p_brand_status: 'approved',
    a2p_campaign_status: 'approved',
    monthly_cost: 12.99,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'n2',
    e164: '+15559876543',
    label: 'Emergency Line',
    status: 'active',
    routing_mode: 'human',
    after_hours: 'forward',
    recording_opt_in: true,
    a2p_brand_status: 'submitted',
    a2p_campaign_status: 'none',
    monthly_cost: 15.99,
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'n3',
    e164: '+15555555555',
    label: 'Overflow',
    status: 'suspended',
    routing_mode: 'overflow',
    after_hours: 'vm',
    recording_opt_in: false,
    monthly_cost: 8.99,
    created_at: '2024-01-03T00:00:00Z'
  }
];

export default function NumbersPage() {
  const [numbers, setNumbers] = useState(mockNumbers);
  const [addNumberOpen, setAddNumberOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const formatPhoneNumber = (e164: string) => {
    const cleaned = e164.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned[0] === '1') {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return e164;
  };


  const testCall = async (numberId: string) => {
    // Mock test call
    alert(`Test call initiated for ${numbers.find(n => n.id === numberId)?.e164}`);
  };

  const columns = [
    {
      header: 'Number',
      accessorKey: 'e164',
      cell: ({ row }: { row: { original: PhoneNumber } }) => (
        <div>
          <div className="font-medium text-text-primary">
            {formatPhoneNumber(row.original.e164)}
          </div>
          <div className="text-sm text-text-secondary">
            {row.original.label}
          </div>
        </div>
      )
    },
    {
      header: 'Routing',
      accessorKey: 'routing_mode',
      cell: ({ row }: { row: { original: PhoneNumber } }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.routing_mode}
        </Badge>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: { row: { original: PhoneNumber } }) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <span className="capitalize">{row.original.status}</span>
        </div>
      )
    },
    {
      header: 'A2P Status',
      accessorKey: 'a2p_campaign_status',
      cell: ({ row }: { row: { original: PhoneNumber } }) => {
        const status = row.original.a2p_campaign_status || 'none';
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <span className="capitalize">{status}</span>
          </div>
        );
      }
    },
    {
      header: 'Budget Cap',
      accessorKey: 'minute_budget_cap',
      cell: ({ row }: { row: { original: PhoneNumber } }) => (
        <span className="text-sm">
          {row.original.minute_budget_cap ? `${row.original.minute_budget_cap} min` : 'None'}
        </span>
      )
    },
    {
      header: 'Monthly Cost',
      accessorKey: 'monthly_cost',
      cell: ({ row }: { row: { original: PhoneNumber } }) => (
        <span className="font-mono">${row.original.monthly_cost}</span>
      )
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: { original: PhoneNumber } }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => testCall(row.original.id)}
          >
            <TestTube className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedNumber(row.original);
              setSettingsOpen(true);
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Phone Numbers</h1>
          <p className="text-text-secondary mt-2">
            Manage your phone numbers and routing configuration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            A2P Setup
          </Button>
          <Dialog open={addNumberOpen} onOpenChange={setAddNumberOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Number
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Phone Number</DialogTitle>
                <DialogDescription>
                  Purchase a new number or port an existing one to your account.
                </DialogDescription>
              </DialogHeader>
              <AddNumberWizard onClose={() => setAddNumberOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        </div>
      </div>

      {/* Numbers Table */}
      <div className="venlyn-card p-0">
        <DataTable
          columns={columns}
          data={numbers}
          onRowClick={(number) => {
            setSelectedNumber(number as PhoneNumber);
            setSettingsOpen(true);
          }}
        />
      </div>

      {/* Number Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Number Settings - {selectedNumber && formatPhoneNumber(selectedNumber.e164)}
            </DialogTitle>
            <DialogDescription>
              Configure routing, hours, and compliance settings for this number.
            </DialogDescription>
          </DialogHeader>
          {selectedNumber && (
            <NumberSettingsPanel 
              number={selectedNumber}
              onClose={() => setSettingsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddNumberWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [numberType, setNumberType] = useState<'buy' | 'port'>('buy');

  return (
    <div className="space-y-6">
      <Tabs value={step.toString()} onValueChange={(v) => setStep(Number(v))}>
        <TabsList className="w-full">
          <TabsTrigger value="1">Choose Option</TabsTrigger>
          <TabsTrigger value="2">Configuration</TabsTrigger>
          <TabsTrigger value="3">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="1" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {setNumberType('buy'); setStep(2);}}
              className={`p-6 border-2 rounded-lg text-left transition-colors ${
                numberType === 'buy' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Phone className="w-8 h-8 mb-3 text-blue-600" />
              <h3 className="font-medium text-text-primary mb-2">Buy New Number</h3>
              <p className="text-sm text-text-secondary">
                Purchase a new phone number from available inventory
              </p>
            </button>
            
            <button
              onClick={() => {setNumberType('port'); setStep(2);}}
              className={`p-6 border-2 rounded-lg text-left transition-colors ${
                numberType === 'port' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-8 h-8 mb-3 text-green-600" />
              <h3 className="font-medium text-text-primary mb-2">Port Existing</h3>
              <p className="text-sm text-text-secondary">
                Transfer your existing number from another provider
              </p>
            </button>
          </div>
        </TabsContent>

        <TabsContent value="2" className="space-y-4">
          {numberType === 'buy' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Area Code Preference</label>
                <Input placeholder="e.g., 555, 212, 415" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Number Label</label>
                <Input placeholder="e.g., Main Line, Support" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Capabilities</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Voice calls
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    SMS messaging
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    MMS messaging
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Number</label>
                <Input placeholder="+1 (555) 123-4567" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Provider</label>
                <Input placeholder="e.g., Verizon, AT&T" />
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">LOA Required</h4>
                <p className="text-sm text-yellow-700">
                  You&apos;ll need to provide a Letter of Authorization to port your number.
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="3" className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-4">Review Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="capitalize">{numberType} number</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly cost:</span>
                <span>$12.99</span>
              </div>
              <div className="flex justify-between">
                <span>Setup fee:</span>
                <span>{numberType === 'port' ? '$25.00' : '$0.00'}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={onClose}>
              {numberType === 'buy' ? 'Purchase Number' : 'Submit Port Request'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NumberSettingsPanel({ number, onClose }: { number: PhoneNumber; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('routing');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="routing">Routing</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="routing" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Routing Mode</label>
            <select className="w-full p-2 border border-gray-200 rounded-lg" defaultValue={number.routing_mode}>
              <option value="ai">AI Primary</option>
              <option value="human">Human Only</option>
              <option value="overflow">Overflow</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">After Hours Behavior</label>
            <select className="w-full p-2 border border-gray-200 rounded-lg" defaultValue={number.after_hours}>
              <option value="ai">Continue with AI</option>
              <option value="vm">Send to voicemail</option>
              <option value="forward">Forward to number</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Recording</label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2" 
                defaultChecked={number.recording_opt_in}
              />
              Enable call recording (with disclosure)
            </label>
          </div>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center">
                <div className="text-sm font-medium mb-2">{day}</div>
                <div className="space-y-2">
                  <Input type="time" defaultValue="09:00" className="text-xs" />
                  <Input type="time" defaultValue="17:00" className="text-xs" />
                </div>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-medium mb-2">Holidays</h4>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Holiday
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Monthly Minute Cap</label>
            <Input 
              type="number" 
              placeholder="1000" 
              defaultValue={number.minute_budget_cap} 
            />
            <p className="text-sm text-text-secondary mt-1">
              Number will be disabled when limit is reached
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Alert Threshold</label>
            <Input type="number" placeholder="800" />
            <p className="text-sm text-text-secondary mt-1">
              Send alert when usage reaches this level
            </p>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">A2P 10DLC Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Brand Status:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(number.a2p_brand_status || 'none')}
                  <span className="capitalize">{number.a2p_brand_status || 'none'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Campaign Status:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(number.a2p_campaign_status || 'none')}
                  <span className="capitalize">{number.a2p_campaign_status || 'none'}</span>
                </div>
              </div>
            </div>
            <Button size="sm" className="mt-3">
              Configure A2P
            </Button>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full">
              <TestTube className="w-4 h-4 mr-2" />
              Run Test Call
            </Button>
            <div className="text-sm text-text-secondary">
              Tests routing, hours, and agent response quality
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button>
          Save Changes
        </Button>
      </div>
    </div>
  );
}