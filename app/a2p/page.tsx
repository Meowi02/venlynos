"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Building,
  MessageSquare,
  Upload,
  Download,
  ExternalLink,
  ChevronRight,
  Plus,
  Edit
} from 'lucide-react';

interface Brand {
  id: string;
  business_name: string;
  ein?: string;
  legal_name?: string;
  business_type: string;
  vertical: string;
  website?: string;
  stock_symbol?: string;
  status: 'none' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  approved_at?: string;
  created_at: string;
}

interface Campaign {
  id: string;
  brand_id: string;
  use_case: string;
  use_case_summary: string;
  message_flow: string;
  subscriber_opt_in: string;
  subscriber_opt_out: string;
  help_keywords: string;
  sample_messages: string[];
  number_pool: string[];
  status: 'none' | 'submitted' | 'approved' | 'rejected' | 'suspended';
  throughput_limit?: number;
  created_at: string;
  submitted_at?: string;
}

// Mock data
const mockBrand: Brand = {
  id: 'brand1',
  business_name: 'PlumbCo Operations',
  ein: '12-3456789',
  legal_name: 'PlumbCo Operations LLC',
  business_type: 'LLC',
  vertical: 'PROFESSIONAL_SERVICES',
  website: 'https://plumbco.com',
  status: 'approved',
  submitted_at: '2024-01-05T00:00:00Z',
  approved_at: '2024-01-10T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z'
};

const mockCampaigns: Campaign[] = [
  {
    id: 'campaign1',
    brand_id: 'brand1',
    use_case: 'TWO_WAY_CONVERSATION',
    use_case_summary: 'Customer service and appointment booking conversations',
    message_flow: 'Customer calls, AI agent responds, may send follow-up SMS with appointment confirmations, receipts, or scheduling updates',
    subscriber_opt_in: 'Verbal consent during phone call, confirmed via SMS',
    subscriber_opt_out: 'Reply STOP to any message',
    help_keywords: 'HELP, INFO, SUPPORT',
    sample_messages: [
      'Hi John, your plumbing appointment is confirmed for tomorrow 2-4pm at 123 Main St. Reply STOP to opt out.',
      'Thank you for choosing PlumbCo! Your service call invoice ($89) is available at: https://plumbco.com/invoice/12345',
      'Service update: Our technician Mike is 10 minutes away from your location. Please ensure access to water main.'
    ],
    number_pool: ['+15551234567', '+15559876543'],
    status: 'approved',
    throughput_limit: 100,
    created_at: '2024-01-12T00:00:00Z',
    submitted_at: '2024-01-15T00:00:00Z'
  }
];

const useCases = [
  'TWO_WAY_CONVERSATION',
  'CUSTOMER_CARE',
  'DELIVERY',
  'MARKETING',
  'PUBLIC_SERVICE_ANNOUNCEMENT',
  'ACCOUNT_NOTIFICATION'
];

const verticals = [
  'PROFESSIONAL_SERVICES',
  'TECHNOLOGY',
  'RETAIL',
  'FINANCE',
  'HEALTHCARE',
  'REAL_ESTATE',
  'AUTOMOTIVE',
  'NONPROFIT'
];

export default function A2PPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [brand, setBrand] = useState(mockBrand);
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'submitted': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'outline'> = {
      'approved': 'default',
      'submitted': 'outline',
      'rejected': 'outline',
      'none': 'outline'
    };
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const handleBrandSubmit = () => {
    setBrand({ ...brand, status: 'submitted', submitted_at: new Date().toISOString() });
    alert('Brand registration submitted for review');
  };

  const handleCampaignSubmit = () => {
    if (selectedCampaign) {
      setCampaigns(campaigns.map(c => 
        c.id === selectedCampaign.id 
          ? { ...c, status: 'submitted', submitted_at: new Date().toISOString() }
          : c
      ));
      alert('Campaign submitted for review');
      setShowCampaignForm(false);
      setSelectedCampaign(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">A2P 10DLC Setup</h1>
            <p className="text-text-secondary mt-1">
              Configure SMS compliance for Application-to-Person messaging
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Documentation
          </Button>
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Carrier Portal
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="venlyn-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Setup Progress</h2>
          <div className="text-sm text-text-secondary">
            Estimated approval time: 2-5 business days
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {[
            { step: 1, title: 'Brand Registration', status: brand.status },
            { step: 2, title: 'Campaign Setup', status: campaigns[0]?.status || 'none' },
            { step: 3, title: 'Number Assignment', status: campaigns[0]?.status === 'approved' ? 'approved' : 'none' }
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                item.status === 'approved' ? 'bg-green-100 text-green-700' :
                item.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {item.status === 'approved' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  item.step
                )}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-text-secondary capitalize">{item.status}</div>
              </div>
              {idx < 2 && (
                <ChevronRight className="w-4 h-4 mx-4 text-text-tertiary" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Registration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="venlyn-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold">Brand Registration</h3>
                {getStatusIcon(brand.status)}
              </div>
              {brand.status !== 'approved' && (
                <Button size="sm" onClick={() => setActiveStep(1)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            {activeStep === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Name</label>
                    <Input
                      value={brand.business_name}
                      onChange={(e) => setBrand({ ...brand, business_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Legal Entity Name</label>
                    <Input
                      value={brand.legal_name || ''}
                      onChange={(e) => setBrand({ ...brand, legal_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">EIN</label>
                    <Input
                      value={brand.ein || ''}
                      onChange={(e) => setBrand({ ...brand, ein: e.target.value })}
                      placeholder="12-3456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Business Type</label>
                    <select 
                      value={brand.business_type}
                      onChange={(e) => setBrand({ ...brand, business_type: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    >
                      <option value="LLC">LLC</option>
                      <option value="CORPORATION">Corporation</option>
                      <option value="PARTNERSHIP">Partnership</option>
                      <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry Vertical</label>
                    <select 
                      value={brand.vertical}
                      onChange={(e) => setBrand({ ...brand, vertical: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg"
                    >
                      {verticals.map(vertical => (
                        <option key={vertical} value={vertical}>
                          {vertical.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input
                      value={brand.website || ''}
                      onChange={(e) => setBrand({ ...brand, website: e.target.value })}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock Symbol (Optional)</label>
                  <Input
                    value={brand.stock_symbol || ''}
                    onChange={(e) => setBrand({ ...brand, stock_symbol: e.target.value })}
                    placeholder="NASDAQ:XXXX"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleBrandSubmit} 
                    disabled={brand.status === 'approved' || brand.status === 'submitted'}
                  >
                    {brand.status === 'submitted' ? 'Submitted' : 'Submit Brand Registration'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Business:</strong> {brand.business_name}</div>
                  <div><strong>Type:</strong> {brand.business_type}</div>
                  <div><strong>EIN:</strong> {brand.ein}</div>
                  <div><strong>Vertical:</strong> {brand.vertical.replace(/_/g, ' ')}</div>
                </div>
                {brand.status === 'approved' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Brand Approved</span>
                    </div>
                    <p className="text-sm text-green-800 mt-1">
                      Your brand registration was approved on {brand.approved_at && new Date(brand.approved_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campaign Setup */}
          <div className="venlyn-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-text-secondary" />
                <h3 className="text-lg font-semibold">Campaign Configuration</h3>
                {campaigns.length > 0 && campaigns[0] && getStatusIcon(campaigns[0].status)}
              </div>
              {brand.status === 'approved' && (
                <div className="flex items-center gap-2">
                  {!showCampaignForm && (
                    <Button size="sm" onClick={() => setShowCampaignForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Campaign
                    </Button>
                  )}
                </div>
              )}
            </div>

            {brand.status !== 'approved' ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Brand Registration Required</span>
                </div>
                <p className="text-sm text-yellow-800 mt-1">
                  Complete and approve your brand registration before creating campaigns.
                </p>
              </div>
            ) : showCampaignForm || campaigns.length === 0 ? (
              <CampaignForm 
                campaign={selectedCampaign}
                onSave={(campaign) => {
                  if (selectedCampaign) {
                    setCampaigns(campaigns.map(c => c.id === selectedCampaign.id ? campaign : c));
                  } else {
                    setCampaigns([...campaigns, { ...campaign, id: `campaign${campaigns.length + 1}` }]);
                  }
                  setShowCampaignForm(false);
                  setSelectedCampaign(null);
                }}
                onCancel={() => {
                  setShowCampaignForm(false);
                  setSelectedCampaign(null);
                }}
              />
            ) : (
              <div className="space-y-4">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{campaign.use_case.replace(/_/g, ' ')}</h4>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowCampaignForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {campaign.status === 'none' && (
                          <Button size="sm" onClick={handleCampaignSubmit}>
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{campaign.use_case_summary}</p>
                    <div className="text-xs text-text-secondary">
                      {campaign.number_pool.length} numbers assigned • 
                      {campaign.throughput_limit ? ` ${campaign.throughput_limit} msgs/min limit` : ' No rate limit'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compliance Status */}
          <div className="venlyn-card">
            <h3 className="font-semibold mb-4">Compliance Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Brand Registration</span>
                {getStatusBadge(brand.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Campaigns</span>
                <Badge variant="outline">
                  {campaigns.filter(c => c.status === 'approved').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Assigned Numbers</span>
                <Badge variant="outline">
                  {campaigns.reduce((acc, c) => acc + c.number_pool.length, 0)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="venlyn-card">
            <h3 className="font-semibold mb-4">Resources</h3>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                A2P 10DLC Guide
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <ExternalLink className="w-4 h-4 mr-2" />
                Carrier Guidelines
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Sample Messages
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          </div>

          {/* Support */}
          <div className="venlyn-card">
            <h3 className="font-semibold mb-4">Need Help?</h3>
            <p className="text-sm text-text-secondary mb-4">
              Our compliance team can help with registration and campaign setup.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CampaignFormProps {
  campaign: Campaign | null;
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
}

function CampaignForm({ campaign, onSave, onCancel }: CampaignFormProps) {
  const [formData, setFormData] = useState<Partial<Campaign>>(
    campaign || {
      use_case: 'TWO_WAY_CONVERSATION',
      use_case_summary: '',
      message_flow: '',
      subscriber_opt_in: '',
      subscriber_opt_out: 'Reply STOP to opt out',
      help_keywords: 'HELP, INFO, SUPPORT',
      sample_messages: [''],
      number_pool: [],
      status: 'none',
      created_at: new Date().toISOString()
    }
  );

  const handleSave = () => {
    onSave(formData as Campaign);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Use Case</label>
        <select 
          value={formData.use_case}
          onChange={(e) => setFormData({ ...formData, use_case: e.target.value })}
          className="w-full p-2 border border-gray-200 rounded-lg"
        >
          {useCases.map(useCase => (
            <option key={useCase} value={useCase}>
              {useCase.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Use Case Summary</label>
        <Input
          value={formData.use_case_summary}
          onChange={(e) => setFormData({ ...formData, use_case_summary: e.target.value })}
          placeholder="Brief description of your messaging use case"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Message Flow</label>
        <textarea
          value={formData.message_flow}
          onChange={(e) => setFormData({ ...formData, message_flow: e.target.value })}
          className="w-full h-20 p-3 border border-gray-200 rounded-lg resize-none"
          placeholder="Describe the customer journey and message flow"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Opt-In Method</label>
          <Input
            value={formData.subscriber_opt_in}
            onChange={(e) => setFormData({ ...formData, subscriber_opt_in: e.target.value })}
            placeholder="e.g., Verbal consent during call"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Opt-Out Method</label>
          <Input
            value={formData.subscriber_opt_out}
            onChange={(e) => setFormData({ ...formData, subscriber_opt_out: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Help Keywords</label>
        <Input
          value={formData.help_keywords}
          onChange={(e) => setFormData({ ...formData, help_keywords: e.target.value })}
          placeholder="HELP, INFO, SUPPORT"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Sample Messages</label>
        <div className="space-y-2">
          {formData.sample_messages?.map((msg, idx) => (
            <textarea
              key={idx}
              value={msg}
              onChange={(e) => {
                const messages = [...(formData.sample_messages || [])];
                messages[idx] = e.target.value;
                setFormData({ ...formData, sample_messages: messages });
              }}
              className="w-full h-16 p-2 border border-gray-200 rounded-lg resize-none text-sm"
              placeholder="Sample message customers will receive"
            />
          ))}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setFormData({ 
              ...formData, 
              sample_messages: [...(formData.sample_messages || []), ''] 
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sample
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Campaign
        </Button>
      </div>
    </div>
  );
}