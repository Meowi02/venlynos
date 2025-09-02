"use client";

import { useState } from 'react';
import {
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import IntentBadge from '@/components/IntentBadge';
import DispositionBadge from '@/components/DispositionBadge';
import { CallItem } from '@/lib/data';
import { formatCurrency, formatDuration } from '@/lib/utils';
import {
  Phone,
  Clock,
  DollarSign,
  User,
  MapPin,
  FileText,
  AlertTriangle,
  Play,
  Volume2,
  MessageSquare,
  Plus,
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

const formatTimestamp = (isoString: string) => {
  return new Date(isoString).toLocaleString();
};

// Mock transcript data
const mockTranscript = [
  {
    timestamp: "00:05",
    speaker: "AI Agent",
    text: "Hello! Thank you for calling PlumbCo. How can I help you today?"
  },
  {
    timestamp: "00:08", 
    speaker: "Customer",
    text: "Hi, I'm having an issue with my water heater. It's not producing hot water."
  },
  {
    timestamp: "00:15",
    speaker: "AI Agent", 
    text: "I'm sorry to hear about your water heater issue. Can you tell me when you first noticed this problem?"
  },
  {
    timestamp: "00:20",
    speaker: "Customer",
    text: "It started yesterday morning. The water is just lukewarm at best."
  },
  {
    timestamp: "00:26",
    speaker: "AI Agent",
    text: "I understand. Based on what you've described, this sounds like it could be a heating element issue. I'd like to schedule a technician to come take a look. Are you available this afternoon?"
  }
];

export default function CallDetailDrawer({ call, onClose }: CallDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <>
      <DrawerHeader>
        <div className="flex items-start justify-between">
          <div>
            <DrawerTitle className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-text-secondary" />
              {call.caller_name || 'Unknown Caller'}
            </DrawerTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
              <span>{formatPhoneNumber(call.from_e164)}</span>
              <span>•</span>
              <span>{formatTimestamp(call.started_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {call.intent && <IntentBadge intent={call.intent} />}
            <DispositionBadge disposition={call.disposition} />
          </div>
        </div>

        {/* Key Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Duration</span>
            </div>
            <div className="text-lg font-semibold text-text-primary">
              {call.duration_sec ? formatDuration(call.duration_sec) : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Est. Value</span>
            </div>
            <div className="text-lg font-semibold text-text-primary">
              {call.value_est_cents ? formatCurrency(call.value_est_cents, true) : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-text-secondary mb-1">
              <User className="w-4 h-4" />
              <span className="text-xs font-medium">Agent</span>
            </div>
            <div className="text-lg font-semibold text-text-primary">
              <Badge variant="outline" className="text-xs">
                {call.agent_type.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </DrawerHeader>

      <DrawerBody>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="notes">Notes & Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6 space-y-6">
            {/* Contact Card */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-text-primary mb-3">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm">{call.caller_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-text-secondary" />
                  <span className="text-sm font-mono">{formatPhoneNumber(call.from_e164)}</span>
                </div>
              </div>
            </div>

            {/* Job Link */}
            {call.job_id ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Linked Job</h4>
                <p className="text-sm text-blue-800">Job #{call.job_id}</p>
                <Button size="sm" className="mt-2" variant="outline">
                  View Job Details
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-text-primary mb-2">No Job Created</h4>
                <p className="text-sm text-text-secondary mb-3">
                  This call hasn&apos;t been converted to a job yet.
                </p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="destructive" size="sm" className="w-full">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Escalate Now
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Mark as Spam
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="transcript" className="mt-6">
            <div className="space-y-4">
              {call.recording_url && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-text-primary">Recording</h4>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </Button>
                      <Button size="sm" variant="outline">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span>0:00</span>
                    <span>{call.duration_sec ? formatDuration(call.duration_sec) : '0:00'}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium text-text-primary">Conversation</h4>
                {mockTranscript.map((entry, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="text-xs text-text-tertiary w-12 flex-shrink-0 mt-1">
                      {entry.timestamp}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-text-secondary mb-1">
                        {entry.speaker}
                      </div>
                      <p className="text-sm text-text-primary">{entry.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary">Call ID</label>
                  <p className="text-sm font-mono text-text-primary">{call.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary">Direction</label>
                  <p className="text-sm text-text-primary capitalize">{call.direction}bound</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary">Started At</label>
                  <p className="text-sm text-text-primary">{formatTimestamp(call.started_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary">Ended At</label>
                  <p className="text-sm text-text-primary">
                    {call.ended_at ? formatTimestamp(call.ended_at) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary">Emergency Score</label>
                  <p className="text-sm text-text-primary">{call.emergency_score || 'N/A'}/10</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary">Spam Score</label>
                  <p className="text-sm text-text-primary">{call.spam_score || 'N/A'}/10</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary">Escalation Status</label>
                  <Badge variant="outline" className="text-xs">
                    {call.escalation_status}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary">Source Number</label>
                  <p className="text-sm font-mono text-text-primary">
                    {formatPhoneNumber(call.to_e164)}
                  </p>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">AI Analysis</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>Intent Classification:</strong> {call.intent ? `${call.intent} (confidence: 94%)` : 'Not classified'}</p>
                  <p><strong>Key Entities:</strong> Water heater, No hot water, Repair needed</p>
                  <p><strong>Sentiment:</strong> Concerned but cooperative</p>
                  <p><strong>Priority:</strong> {call.intent === 'emergency' ? 'High' : 'Medium'}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">Internal Notes</label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm"
                  rows={4}
                  placeholder="Add internal notes about this call..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-primary mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">follow-up</Badge>
                  <Badge variant="outline" className="text-xs">water-heater</Badge>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                    + Add Tag
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DrawerBody>

      <DrawerFooter>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Call Back
            </Button>
            <Button size="sm">
              Save Changes
            </Button>
          </div>
        </div>
      </DrawerFooter>
    </>
  );
}