"use client";

import { CallItem } from '@/lib/data';
import { formatDuration, formatCurrency } from '@/lib/utils';
import IntentBadge from './IntentBadge';
import DispositionBadge from './DispositionBadge';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Phone, 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  MapPin,
  MessageSquare,
  Play,
  Download,
  ExternalLink,
  X
} from 'lucide-react';

interface CallDetailDrawerProps {
  call: CallItem;
  onClose: () => void;
}

const formatPhoneNumber = (e164: string) => {
  const cleaned = e164.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned[0] === '1') {
    const number = cleaned.slice(1);
    return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  return e164;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function CallDetailDrawer({ call, onClose }: CallDetailDrawerProps) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Call Details</h2>
          <p className="text-text-secondary mt-1">
            {formatDate(call.started_at)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Call Information */}
        <div className="space-y-6">
          {/* Caller Information */}
          <div className="venlyn-card">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Caller Information
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-text-secondary">Name</label>
                <p className="text-text-primary font-medium">
                  {call.caller_name || 'Unknown Caller'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary">Phone Number</label>
                <p className="text-text-primary font-mono">
                  {formatPhoneNumber(call.from_e164)}
                </p>
              </div>
              
              {call.caller_location && (
                <div>
                  <label className="text-sm font-medium text-text-secondary">Location</label>
                  <p className="text-text-primary flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {call.caller_location}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Call Details */}
          <div className="venlyn-card">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Call Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Duration</span>
                <span className="text-text-primary font-mono flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {call.duration_sec ? formatDuration(call.duration_sec) : 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Intent</span>
                {call.intent ? <IntentBadge intent={call.intent} /> : <span className="text-text-tertiary">Unknown</span>}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Disposition</span>
                <DispositionBadge disposition={call.disposition} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Agent Type</span>
                <Badge variant="outline">
                  {call.agent_type.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Source Number</span>
                <span className="text-text-primary font-mono">
                  {formatPhoneNumber(call.to_e164)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Additional Information */}
        <div className="space-y-6">
          {/* Value & Business Impact */}
          <div className="venlyn-card">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Business Impact
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Estimated Value</span>
                <span className="text-text-primary font-mono text-lg font-semibold">
                  {call.value_est_cents ? formatCurrency(call.value_est_cents, true) : 'Unknown'}
                </span>
              </div>
              
              {call.job_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Job Created</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Job #{call.job_id}
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">Escalation Status</span>
                <Badge variant={call.escalation_status === 'none' ? 'outline' : 'destructive'}>
                  {call.escalation_status === 'none' ? 'Normal' : call.escalation_status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="venlyn-card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Actions</h3>
            
            <div className="space-y-3">
              {call.recording_url && (
                <Button className="w-full justify-start" variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Play Recording
                </Button>
              )}
              
              <Button className="w-full justify-start" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Transcript
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                View Messages
              </Button>
              
              {call.job_id && (
                <Button className="w-full justify-start" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Job #{call.job_id}
                </Button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="venlyn-card">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Call Timeline
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Call Started</p>
                  <p className="text-xs text-text-secondary">{formatDate(call.started_at)}</p>
                </div>
              </div>
              
              {call.duration_sec && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Call Completed</p>
                    <p className="text-xs text-text-secondary">
                      Duration: {formatDuration(call.duration_sec)}
                    </p>
                  </div>
                </div>
              )}
              
              {call.job_id && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Job Created</p>
                    <p className="text-xs text-text-secondary">Job #{call.job_id}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}