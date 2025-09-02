'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, 
  Phone, 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  Plus, 
  Edit3,
  MessageSquare,
  UserPlus,
  Calendar,
  AlertTriangle,
  Ban,
  Tag,
  Upload,
  Download,
  Copy,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Search,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Archive,
  Trash2,
  Share2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Save
} from 'lucide-react';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { cn } from '@/lib/cn';
import { AudioPlayer } from '@/components/media/AudioPlayer';
import { TranscriptView } from '@/components/media/TranscriptView';
import type { Call, FollowUpTask, Contact } from '@/types/core';

interface CallDrawerProps {
  callId: string | null;
  isOpen: boolean;
  onClose: () => void;
  triageMode?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onAutoAdvance?: () => void;
}

interface ExtendedCall extends Call {
  contact?: Contact;
  job?: any;
  followUpTasks?: FollowUpTask[];
  history?: Call[];
}

interface DispositionRule {
  value: string;
  label: string;
  requiresNote: boolean;
  requiresFollowUp: boolean;
  slaMinutes?: number;
  color: string;
}

interface SLATimer {
  type: string;
  dueAt: Date;
  remainingMinutes: number;
  status: 'ok' | 'warning' | 'critical' | 'overdue';
}

export function CallDrawer({ 
  callId, 
  isOpen, 
  onClose,
  triageMode = false,
  onNext,
  onPrevious, 
  hasNext,
  hasPrevious,
  onAutoAdvance
}: CallDrawerProps) {
  const [call, setCall] = useState<ExtendedCall | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'recording' | 'transcript' | 'details' | 'history' | 'job'>('summary');
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  
  // New state for enhanced functionality
  const [selectedDisposition, setSelectedDisposition] = useState('');
  const [dispositionNote, setDispositionNote] = useState('');
  const [valueEstimate, setValueEstimate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [followUpType, setFollowUpType] = useState<'callback' | 'sms' | 'email' | 'task'>('callback');
  const [followUpDue, setFollowUpDue] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [slaTimers, setSlaTimers] = useState<SLATimer[]>([]);
  const [contactLinking, setContactLinking] = useState(false);
  const [newContactData, setNewContactData] = useState({ name: '', email: '', address: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Disposition rules with validation
  const dispositionRules: DispositionRule[] = [
    { value: 'answered', label: 'Answered', requiresNote: false, requiresFollowUp: false, color: 'bg-green-100 text-green-800' },
    { value: 'missed', label: 'Missed', requiresNote: true, requiresFollowUp: true, slaMinutes: 30, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'booked', label: 'Booked', requiresNote: false, requiresFollowUp: false, color: 'bg-blue-100 text-blue-800' },
    { value: 'callback', label: 'Callback Scheduled', requiresNote: true, requiresFollowUp: true, slaMinutes: 60, color: 'bg-purple-100 text-purple-800' },
    { value: 'spam', label: 'Spam', requiresNote: false, requiresFollowUp: false, color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (isOpen && callId) {
      loadCall(callId);
    }
  }, [isOpen, callId]);
  
  // Initialize form data when call loads
  useEffect(() => {
    if (call) {
      setSelectedDisposition(call.disposition || '');
      setValueEstimate(call.valueEstCents ? (call.valueEstCents / 100).toString() : '');
      setSelectedTags(call.tags || []);
      setNotes((call.transcript as any)?.metadata?.notes || '');
      
      // Calculate SLA timers
      updateSLATimers(call);
    }
  }, [call]);
  
  // Auto-save on changes with debouncing
  useEffect(() => {
    if (call && (selectedDisposition || dispositionNote || valueEstimate)) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedDisposition, dispositionNote, valueEstimate]);

  const loadCall = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calls/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCall(data.call);
        
        // Load call history if contact is linked
        if (data.call.contactId) {
          await loadCallHistory(data.call.contactId);
        }
      }
    } catch (error) {
      console.error('Failed to load call:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadCallHistory = async (contactId: string) => {
    try {
      const response = await fetch(`/api/calls?contactId=${contactId}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setCall(prev => prev ? { ...prev, history: data.data } : prev);
      }
    } catch (error) {
      console.error('Failed to load call history:', error);
    }
  };
  
  const updateSLATimers = useCallback((call: ExtendedCall) => {
    const timers: SLATimer[] = [];
    
    // Check for required callback SLA
    if (call.disposition === 'missed' && !call.outcomeAt) {
      const dueAt = new Date(new Date(call.startedAt).getTime() + 30 * 60 * 1000); // 30 minutes
      const remainingMinutes = Math.max(0, Math.floor((dueAt.getTime() - Date.now()) / (1000 * 60)));
      
      timers.push({
        type: 'Callback Required',
        dueAt,
        remainingMinutes,
        status: remainingMinutes > 10 ? 'ok' : remainingMinutes > 5 ? 'warning' : remainingMinutes > 0 ? 'critical' : 'overdue'
      });
    }
    
    // Check follow-up tasks
    call.followUpTasks?.forEach(task => {
      if (task.status === 'open') {
        const dueAt = new Date(task.dueAt);
        const remainingMinutes = Math.max(0, Math.floor((dueAt.getTime() - Date.now()) / (1000 * 60)));
        
        timers.push({
          type: task.type.charAt(0).toUpperCase() + task.type.slice(1),
          dueAt,
          remainingMinutes,
          status: remainingMinutes > 60 ? 'ok' : remainingMinutes > 30 ? 'warning' : remainingMinutes > 0 ? 'critical' : 'overdue'
        });
      }
    });
    
    setSlaTimers(timers);
  }, []);
  
  const handleAutoSave = useCallback(async () => {
    if (!call || saving) return;
    
    setSaving(true);
    try {
      const updateData: any = {};
      
      if (selectedDisposition) {
        updateData.disposition = selectedDisposition;
        updateData.outcomeAt = new Date().toISOString();
      }
      
      if (valueEstimate) {
        updateData.valueEstCents = Math.round(parseFloat(valueEstimate) * 100);
      }
      
      if (selectedTags.length > 0) {
        updateData.tags = selectedTags;
      }
      
      if (Object.keys(updateData).length > 0) {
        const response = await fetch(`/api/calls/${call.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          const data = await response.json();
          setCall(data.call);
          updateSLATimers(data.call);
          
          // Auto-advance in triage mode if outcome is set
          if (triageMode && selectedDisposition && onAutoAdvance) {
            setTimeout(() => onAutoAdvance(), 1000);
          }
        }
      }
    } catch (error) {
      console.error('Failed to auto-save:', error);
    } finally {
      setSaving(false);
    }
  }, [call, selectedDisposition, valueEstimate, selectedTags, saving, triageMode, onAutoAdvance]);

  const handleCreateJob = async () => {
    if (!call) return;
    
    try {
      const response = await fetch(`/api/calls/${call.id}/link-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Service for ${call.contact?.name || 'Unknown Customer'}`,
          status: 'new',
          estimateCents: valueEstimate ? Math.round(parseFloat(valueEstimate) * 100) : undefined,
        }),
      });

      if (response.ok) {
        await loadCall(call.id);
        setActiveTab('job');
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };
  
  const handleScheduleFollowUp = async () => {
    if (!call || !followUpDue) return;
    
    try {
      const response = await fetch(`/api/calls/${call.id}/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: followUpType,
          dueAt: followUpDue,
          note: followUpNote,
          priority: call.intent === 'emergency' ? 'urgent' : 'normal'
        }),
      });

      if (response.ok) {
        await loadCall(call.id);
        setFollowUpDue('');
        setFollowUpNote('');
      }
    } catch (error) {
      console.error('Failed to schedule follow-up:', error);
    }
  };
  
  const handleClickToCall = async () => {
    if (!call) return;
    
    try {
      const response = await fetch(`/api/calls/${call.id}/click-to-call`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Show dialing status or redirect to phone interface
        console.log('Call initiated');
      }
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };
  
  const handleSendSMS = async (template?: string) => {
    if (!call) return;
    
    try {
      const response = await fetch(`/api/calls/${call.id}/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: template || 'general',
          variables: {
            customerName: call.contact?.name || 'there',
            jobTime: call.job?.slotStart ? format(new Date(call.job.slotStart), 'MMM d at h:mm a') : 'TBD'
          }
        }),
      });
      
      if (response.ok) {
        console.log('SMS sent');
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
      setShowTagInput(false);
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };
  
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    setAttachments(prev => [...prev, ...newFiles]);
    
    // TODO: Upload files to server
    console.log('Uploading files:', newFiles.map(f => f.name));
  };
  
  const handleLinkContact = async () => {
    if (!call) return;
    
    try {
      const response = await fetch(`/api/calls/${call.id}/link-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContactData),
      });
      
      if (response.ok) {
        await loadCall(call.id);
        setContactLinking(false);
        setNewContactData({ name: '', email: '', address: '' });
      }
    } catch (error) {
      console.error('Failed to link contact:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!call) return;

    try {
      const response = await fetch(`/api/calls/${call.id}/tags`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setEditingNotes(false);
        await loadCall(call.id);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };
  
  const getDispositionRule = (disposition: string) => {
    return dispositionRules.find(rule => rule.value === disposition);
  };
  
  const isDispositionValid = () => {
    if (!selectedDisposition) return false;
    
    const rule = getDispositionRule(selectedDisposition);
    if (!rule) return false;
    
    if (rule.requiresNote && !dispositionNote.trim()) return false;
    if (rule.requiresFollowUp && !followUpDue) return false;
    
    return true;
  };
  
  // Quick time shortcuts for follow-ups
  const getQuickTimes = () => {
    const now = new Date();
    return [
      { label: '30 min', value: new Date(now.getTime() + 30 * 60 * 1000).toISOString().slice(0, 16) },
      { label: '2 hours', value: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16) },
      { label: 'Tomorrow 9am', value: (() => {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow.toISOString().slice(0, 16);
      })() },
    ];
  };

  const formatPhoneNumber = useCallback((phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const formatted = cleaned.slice(1);
      return `+1 (${formatted.slice(0,3)}) ${formatted.slice(3,6)}-${formatted.slice(6)}`;
    }
    return phone;
  }, []);

  const formatDuration = useCallback((seconds: number | undefined) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  const getSLAStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-orange-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  const getSLAIcon = (status: string) => {
    switch (status) {
      case 'ok': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'critical': return AlertTriangle;
      case 'overdue': return XCircle;
      default: return Clock;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 bg-slate-50">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Call Details
                  {call && call.intent === 'emergency' && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Emergency
                    </span>
                  )}
                </h2>
                {call && (
                  <p className="text-sm text-slate-500">
                    {format(new Date(call.startedAt), 'MMM d, yyyy at h:mm a')} • {formatDuration(call.durationSec)}
                    {call.doNotContact && (
                      <span className="ml-2 inline-flex items-center text-xs text-red-600">
                        <Ban className="h-3 w-3 mr-1" />
                        DNC
                      </span>
                    )}
                  </p>
                )}\n              </div>\n              \n              {/* SLA Timers */}\n              {slaTimers.length > 0 && (\n                <div className=\"flex items-center space-x-2\">\n                  {slaTimers.map((timer, index) => {\n                    const Icon = getSLAIcon(timer.status);\n                    return (\n                      <div key={index} className={cn(\n                        \"flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium\",\n                        timer.status === 'overdue' ? 'bg-red-100 text-red-800' :\n                        timer.status === 'critical' ? 'bg-orange-100 text-orange-800' :\n                        timer.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :\n                        'bg-green-100 text-green-800'\n                      )}>\n                        <Icon className=\"h-3 w-3\" />\n                        <span>{timer.type}: {timer.remainingMinutes}m</span>\n                      </div>\n                    );\n                  })}\n                </div>\n              )}\n            </div>\n            \n            <div className=\"flex items-center space-x-2\">\n              {/* Quick Actions */}\n              {call && (\n                <>\n                  <button\n                    onClick={handleClickToCall}\n                    className=\"flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded hover:bg-blue-50 transition-colors\"\n                    disabled={call.doNotContact}\n                    title={call.doNotContact ? \"Contact has requested Do Not Contact\" : \"Click to call\"}\n                  >\n                    <Phone className=\"h-4 w-4\" />\n                    <span>Call</span>\n                  </button>\n                  \n                  <button\n                    onClick={() => handleSendSMS()}\n                    className=\"flex items-center space-x-1 px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded hover:bg-green-50 transition-colors\"\n                    disabled={call.doNotContact || !call.contact}\n                  >\n                    <MessageSquare className=\"h-4 w-4\" />\n                    <span>SMS</span>\n                  </button>\n                  \n                  {!call.jobId && (\n                    <button\n                      onClick={handleCreateJob}\n                      className=\"flex items-center space-x-1 px-3 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded hover:bg-purple-50 transition-colors\"\n                    >\n                      <UserPlus className=\"h-4 w-4\" />\n                      <span>Create Job</span>\n                    </button>\n                  )}\n                </>\n              )}\n              \n              {/* Triage Navigation */}\n              {triageMode && (\n                <div className=\"flex items-center space-x-1 ml-4\">\n                  <button\n                    onClick={onPrevious}\n                    disabled={!hasPrevious}\n                    className=\"p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 rounded\"\n                  >\n                    <ChevronLeft className=\"h-4 w-4\" />\n                  </button>\n                  <button\n                    onClick={onNext}\n                    disabled={!hasNext}\n                    className=\"p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50 rounded\"\n                  >\n                    <ChevronRight className=\"h-4 w-4\" />\n                  </button>\n                </div>\n              )}\n              \n              <button\n                onClick={onClose}\n                className=\"rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600\"\n              >\n                <X className=\"h-5 w-5\" />\n              </button>\n            </div>\n          </div>\n\n          {loading ? (\n            <div className=\"flex-1 flex items-center justify-center\">\n              <div className=\"text-center\">\n                <div className=\"w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4\"></div>\n                <p className=\"text-slate-500\">Loading call details...</p>\n              </div>\n            </div>\n          ) : call ? (\n            <>\n              {/* Enhanced Tabs */}\n              <div className=\"border-b px-6 bg-white\">\n                <nav className=\"-mb-px flex space-x-8\">\n                  {[\n                    { id: 'summary' as const, label: 'Summary', icon: Info },\n                    { id: 'recording' as const, label: 'Recording', icon: Play },\n                    { id: 'transcript' as const, label: 'Transcript', icon: FileText },\n                    { id: 'details' as const, label: 'Details', icon: Settings },\n                    { id: 'history' as const, label: 'History', icon: Clock },\n                    { id: 'job' as const, label: 'Job', icon: UserPlus },\n                  ].map((tab) => {\n                    const Icon = tab.icon;\n                    const isActive = activeTab === tab.id;\n                    \n                    return (\n                      <button\n                        key={tab.id}\n                        onClick={() => setActiveTab(tab.id)}\n                        className={cn(\n                          \"flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors\",\n                          isActive\n                            ? \"border-blue-500 text-blue-600\"\n                            : \"border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300\"\n                        )}\n                      >\n                        <Icon className=\"h-4 w-4\" />\n                        <span>{tab.label}</span>\n                        {tab.id === 'job' && call.jobId && (\n                          <span className=\"w-2 h-2 bg-green-500 rounded-full\"></span>\n                        )}\n                      </button>\n                    );\n                  })}\n                </nav>\n              </div>\n\n              {/* Tab Content */}\n              <div className=\"flex-1 overflow-auto bg-slate-50\">\n                {activeTab === 'summary' && (\n                  <div className=\"p-6 space-y-6\">\n                    {/* Contact & Call Info */}\n                    <div className=\"bg-white rounded-lg p-6 shadow-sm\">\n                      <h3 className=\"text-lg font-medium text-slate-900 mb-4\">Call Information</h3>\n                      \n                      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">\n                        {/* Contact */}\n                        <div>\n                          <div className=\"flex items-center justify-between mb-3\">\n                            <h4 className=\"text-sm font-medium text-slate-900\">Contact</h4>\n                            {!call.contact && (\n                              <button \n                                onClick={() => setContactLinking(true)}\n                                className=\"text-xs text-blue-600 hover:text-blue-800\"\n                              >\n                                Link Contact\n                              </button>\n                            )}\n                          </div>\n                          \n                          {call.contact ? (\n                            <div>\n                              <p className=\"text-lg font-semibold text-slate-900\">{call.contact.name}</p>\n                              <p className=\"text-sm text-slate-600\">{formatPhoneNumber(call.fromE164)}</p>\n                              {call.contact.email && (\n                                <p className=\"text-sm text-slate-600\">{call.contact.email}</p>\n                              )}\n                            </div>\n                          ) : (\n                            <div>\n                              <p className=\"text-lg font-semibold text-slate-900\">Unknown Caller</p>\n                              <p className=\"text-sm text-slate-600\">{formatPhoneNumber(call.fromE164)}</p>\n                            </div>\n                          )}\n                        </div>\n                        \n                        {/* Call Details */}\n                        <div>\n                          <h4 className=\"text-sm font-medium text-slate-900 mb-3\">Call Details</h4>\n                          <div className=\"space-y-2\">\n                            <div className=\"flex justify-between\">\n                              <span className=\"text-sm text-slate-600\">Duration:</span>\n                              <span className=\"text-sm text-slate-900\">{formatDuration(call.durationSec)}</span>\n                            </div>\n                            <div className=\"flex justify-between\">\n                              <span className=\"text-sm text-slate-600\">Direction:</span>\n                              <span className=\"text-sm text-slate-900\">{call.direction === 'in' ? 'Inbound' : 'Outbound'}</span>\n                            </div>\n                            <div className=\"flex justify-between\">\n                              <span className=\"text-sm text-slate-600\">Agent:</span>\n                              <span className=\"text-sm text-slate-900\">{call.agentType === 'ai' ? 'AI' : 'Human'}</span>\n                            </div>\n                          </div>\n                        </div>\n                        \n                        {/* Status & Value */}\n                        <div>\n                          <h4 className=\"text-sm font-medium text-slate-900 mb-3\">Status & Value</h4>\n                          <div className=\"space-y-3\">\n                            {call.intent && (\n                              <div>\n                                <span className=\"text-xs text-slate-600\">Intent</span>\n                                <div className=\"mt-1\">\n                                  <span className={cn(\n                                    \"inline-flex px-2 py-1 text-xs font-semibold rounded-full\",\n                                    call.intent === 'emergency' ? 'bg-red-100 text-red-800' :\n                                    call.intent === 'routine' ? 'bg-green-100 text-green-800' :\n                                    'bg-blue-100 text-blue-800'\n                                  )}>\n                                    {call.intent}\n                                  </span>\n                                </div>\n                              </div>\n                            )}\n                            \n                            {call.valueEstCents && (\n                              <div>\n                                <span className=\"text-xs text-slate-600\">Estimated Value</span>\n                                <p className=\"text-lg font-semibold text-slate-900\">\n                                  ${(call.valueEstCents / 100).toFixed(2)}\n                                </p>\n                              </div>\n                            )}\n                          </div>\n                        </div>\n                      </div>\n                    </div>\n                    \n                    {/* Outcome & Follow-up Section */}\n                    <div className=\"bg-white rounded-lg p-6 shadow-sm\">\n                      <h3 className=\"text-lg font-medium text-slate-900 mb-4\">Outcome & Next Actions</h3>\n                      \n                      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">\n                        {/* Required Disposition */}\n                        <div>\n                          <label className=\"block text-sm font-medium text-slate-900 mb-2\">\n                            Disposition \n                            {call.outcomeRequired && <span className=\"text-red-500\">*</span>}\n                          </label>\n                          \n                          <select\n                            value={selectedDisposition}\n                            onChange={(e) => setSelectedDisposition(e.target.value)}\n                            className=\"w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent\"\n                          >\n                            <option value=\"\">Select outcome...</option>\n                            {dispositionRules.map(rule => (\n                              <option key={rule.value} value={rule.value}>{rule.label}</option>\n                            ))}\n                          </select>\n                          \n                          {selectedDisposition && getDispositionRule(selectedDisposition)?.requiresNote && (\n                            <textarea\n                              value={dispositionNote}\n                              onChange={(e) => setDispositionNote(e.target.value)}\n                              placeholder=\"Please provide additional details...\"\n                              rows={3}\n                              className=\"mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent\"\n                            />\n                          )}\n                        </div>\n                        \n                        {/* Value Estimate */}\n                        <div>\n                          <label className=\"block text-sm font-medium text-slate-900 mb-2\">\n                            Value Estimate\n                          </label>\n                          \n                          <div className=\"relative\">\n                            <span className=\"absolute left-3 top-2 text-slate-500\">$</span>\n                            <input\n                              type=\"number\"\n                              value={valueEstimate}\n                              onChange={(e) => setValueEstimate(e.target.value)}\n                              placeholder=\"0\"\n                              className=\"w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent\"\n                            />\n                          </div>\n                          \n                          {/* Quick presets */}\n                          <div className=\"mt-2 flex space-x-2\">\n                            {['100', '300', '500', '1000'].map(amount => (\n                              <button\n                                key={amount}\n                                onClick={() => setValueEstimate(amount)}\n                                className=\"px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors\"\n                              >\n                                ${amount}\n                              </button>\n                            ))}\n                          </div>\n                        </div>\n                      </div>\n                    </div>\n                    \n                    {/* Follow-ups Section */}\n                    {(call.followUpTasks?.length > 0 || (selectedDisposition && getDispositionRule(selectedDisposition)?.requiresFollowUp)) && (\n                      <div className=\"bg-white rounded-lg p-6 shadow-sm\">\n                        <h3 className=\"text-lg font-medium text-slate-900 mb-4\">Follow-ups</h3>\n                        \n                        {/* Existing Follow-ups */}\n                        {call.followUpTasks?.map(task => (\n                          <div key={task.id} className=\"flex items-center justify-between p-3 border border-slate-200 rounded-lg mb-3\">\n                            <div>\n                              <div className=\"flex items-center space-x-2\">\n                                <span className=\"text-sm font-medium text-slate-900\">{task.type}</span>\n                                <span className={cn(\n                                  \"inline-flex px-2 py-1 text-xs font-semibold rounded-full\",\n                                  task.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'\n                                )}>\n                                  {task.status}\n                                </span>\n                              </div>\n                              <p className=\"text-sm text-slate-600\">\n                                Due: {format(new Date(task.dueAt), 'MMM d at h:mm a')} \n                                ({formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })})\n                              </p>\n                              {task.note && <p className=\"text-sm text-slate-500 mt-1\">{task.note}</p>}\n                            </div>\n                            \n                            {task.status === 'open' && (\n                              <button\n                                className=\"px-3 py-1 text-sm text-green-600 hover:text-green-800\"\n                                onClick={() => {\n                                  // Mark as complete\n                                  console.log('Mark complete:', task.id);\n                                }}\n                              >\n                                Complete\n                              </button>\n                            )}\n                          </div>\n                        ))}\n                        \n                        {/* Schedule New Follow-up */}\n                        {selectedDisposition && getDispositionRule(selectedDisposition)?.requiresFollowUp && (\n                          <div className=\"border-t pt-4\">\n                            <h4 className=\"text-sm font-medium text-slate-900 mb-3\">Schedule Follow-up</h4>\n                            \n                            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-4\">\n                              <div>\n                                <label className=\"block text-sm font-medium text-slate-700 mb-1\">Type</label>\n                                <select\n                                  value={followUpType}\n                                  onChange={(e) => setFollowUpType(e.target.value as any)}\n                                  className=\"w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\"\n                                >\n                                  <option value=\"callback\">Callback</option>\n                                  <option value=\"sms\">SMS</option>\n                                  <option value=\"email\">Email</option>\n                                  <option value=\"task\">Task</option>\n                                </select>\n                              </div>\n                              \n                              <div>\n                                <label className=\"block text-sm font-medium text-slate-700 mb-1\">Due Date & Time</label>\n                                <input\n                                  type=\"datetime-local\"\n                                  value={followUpDue}\n                                  onChange={(e) => setFollowUpDue(e.target.value)}\n                                  className=\"w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\"\n                                />\n                                \n                                {/* Quick time buttons */}\n                                <div className=\"mt-2 flex space-x-2\">\n                                  {getQuickTimes().map(time => (\n                                    <button\n                                      key={time.label}\n                                      onClick={() => setFollowUpDue(time.value)}\n                                      className=\"px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100\"\n                                    >\n                                      {time.label}\n                                    </button>\n                                  ))}\n                                </div>\n                              </div>\n                            </div>\n                            \n                            <div className=\"mt-4\">\n                              <textarea\n                                value={followUpNote}\n                                onChange={(e) => setFollowUpNote(e.target.value)}\n                                placeholder=\"Follow-up notes (optional)...\"\n                                rows={2}\n                                className=\"w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500\"\n                              />\n                            </div>\n                            \n                            <div className=\"mt-4\">\n                              <button\n                                onClick={handleScheduleFollowUp}\n                                disabled={!followUpDue}\n                                className=\"px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors\"\n                              >\n                                Schedule Follow-up\n                              </button>\n                            </div>\n                          </div>\n                        )}\n                      </div>\n                    )}\n                    \n                    {/* Tags */}\n                    <div className=\"bg-white rounded-lg p-6 shadow-sm\">\n                      <div className=\"flex items-center justify-between mb-4\">\n                        <h3 className=\"text-lg font-medium text-slate-900\">Tags</h3>\n                        <button\n                          onClick={() => setShowTagInput(true)}\n                          className=\"flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800\"\n                        >\n                          <Tag className=\"h-4 w-4\" />\n                          <span>Add Tag</span>\n                        </button>\n                      </div>\n                      \n                      <div className=\"flex flex-wrap gap-2\">\n                        {selectedTags.map(tag => (\n                          <span\n                            key={tag}\n                            className=\"inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full group\"\n                          >\n                            {tag}\n                            <button\n                              onClick={() => handleRemoveTag(tag)}\n                              className=\"ml-2 text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity\"\n                            >\n                              <X className=\"h-3 w-3\" />\n                            </button>\n                          </span>\n                        ))}\n                        \n                        {showTagInput && (\n                          <div className=\"inline-flex items-center space-x-2\">\n                            <input\n                              type=\"text\"\n                              value={newTag}\n                              onChange={(e) => setNewTag(e.target.value)}\n                              onKeyDown={(e) => {\n                                if (e.key === 'Enter') handleAddTag();\n                                if (e.key === 'Escape') { setShowTagInput(false); setNewTag(''); }\n                              }}\n                              placeholder=\"Tag name\"\n                              className=\"px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500\"\n                              autoFocus\n                            />\n                            <button\n                              onClick={handleAddTag}\n                              className=\"px-2 py-1 text-sm text-green-600 hover:text-green-800\"\n                            >\n                              <CheckCircle className=\"h-4 w-4\" />\n                            </button>\n                            <button\n                              onClick={() => { setShowTagInput(false); setNewTag(''); }}\n                              className=\"px-2 py-1 text-sm text-slate-400 hover:text-slate-600\"\n                            >\n                              <XCircle className=\"h-4 w-4\" />\n                            </button>\n                          </div>\n                        )}\n                        \n                        {selectedTags.length === 0 && !showTagInput && (\n                          <span className=\"text-sm text-slate-500 italic\">No tags added</span>\n                        )}\n                      </div>\n                    </div>\n                  </div>\n                )}\n                \n                {/* Additional tab contents would go here - Recording, Transcript, Details, History, Job */}\n                {/* For brevity, I'll implement the key Summary tab and outline the others */}\n                \n                {activeTab === 'recording' && (\n                  <div className=\"p-6\">\n                    <div className=\"bg-white rounded-lg p-6 shadow-sm\">\n                      {call.recordingUrl ? (\n                        <>\n                          <div className=\"flex items-center justify-between mb-4\">\n                            <h3 className=\"text-lg font-medium text-slate-900\">Call Recording</h3>\n                            <div className=\"flex items-center space-x-2\">\n                              <button className=\"flex items-center space-x-1 px-3 py-1 text-sm text-slate-600 hover:text-slate-800\">\n                                <Download className=\"h-4 w-4\" />\n                                <span>Download</span>\n                              </button>\n                              <button className=\"flex items-center space-x-1 px-3 py-1 text-sm text-slate-600 hover:text-slate-800\">\n                                <Share2 className=\"h-4 w-4\" />\n                                <span>Share</span>\n                              </button>\n                            </div>\n                          </div>\n                          \n                          <AudioPlayer \n                            src={call.recordingUrl}\n                            onTimeUpdate={(time) => setCurrentAudioTime(time)}\n                          />\n                          \n                          {/* Consent Information */}\n                          <div className=\"mt-6 p-4 bg-slate-50 rounded-lg\">\n                            <div className=\"flex items-center justify-between\">\n                              <div>\n                                <h4 className=\"text-sm font-medium text-slate-900\">Recording Consent</h4>\n                                <p className=\"text-sm text-slate-600\">\n                                  {call.consent?.recording ? 'Caller consented to recording' : 'Consent status not recorded'}\n                                </p>\n                              </div>\n                              {call.consent?.lastUpdated && (\n                                <span className=\"text-xs text-slate-500\">\n                                  Updated {format(new Date(call.consent.lastUpdated), 'MMM d, h:mm a')}\n                                </span>\n                              )}\n                            </div>\n                          </div>\n                          \n                          {/* Attachments */}\n                          <div className=\"mt-6\">\n                            <div className=\"flex items-center justify-between mb-3\">\n                              <h4 className=\"text-sm font-medium text-slate-900\">Attachments</h4>\n                              <button\n                                onClick={() => fileInputRef.current?.click()}\n                                className=\"flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800\"\n                              >\n                                <Upload className=\"h-4 w-4\" />\n                                <span>Upload</span>\n                              </button>\n                            </div>\n                            \n                            <input\n                              ref={fileInputRef}\n                              type=\"file\"\n                              multiple\n                              onChange={(e) => handleFileUpload(e.target.files)}\n                              className=\"hidden\"\n                            />\n                            \n                            {attachments.length > 0 ? (\n                              <div className=\"space-y-2\">\n                                {attachments.map((file, index) => (\n                                  <div key={index} className=\"flex items-center justify-between p-2 border border-slate-200 rounded\">\n                                    <span className=\"text-sm text-slate-900\">{file.name}</span>\n                                    <span className=\"text-xs text-slate-500\">{(file.size / 1024).toFixed(1)} KB</span>\n                                  </div>\n                                ))}\n                              </div>\n                            ) : (\n                              <p className=\"text-sm text-slate-500 italic\">No attachments</p>\n                            )}\n                          </div>\n                        </>\n                      ) : (\n                        <div className=\"text-center py-12\">\n                          <div className=\"mx-auto h-12 w-12 text-slate-400 mb-4\">\n                            <Volume2 className=\"h-12 w-12\" />\n                          </div>\n                          <h3 className=\"text-sm font-medium text-slate-900 mb-2\">No Recording Available</h3>\n                          <p className=\"text-sm text-slate-500\">This call was not recorded or the recording is not available.</p>\n                        </div>\n                      )}\n                    </div>\n                  </div>\n                )}\n                \n                {activeTab === 'transcript' && (\n                  <div className=\"p-6\">\n                    <div className=\"bg-white rounded-lg p-6 shadow-sm\">\n                      {call.transcript ? (\n                        <>\n                          <div className=\"flex items-center justify-between mb-4\">\n                            <h3 className=\"text-lg font-medium text-slate-900\">Call Transcript</h3>\n                            <div className=\"flex items-center space-x-2\">\n                              <div className=\"relative\">\n                                <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400\" />\n                                <input\n                                  type=\"text\"\n                                  value={transcriptSearch}\n                                  onChange={(e) => setTranscriptSearch(e.target.value)}\n                                  placeholder=\"Search transcript...\"\n                                  className=\"pl-10 pr-3 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500\"\n                                />\n                              </div>\n                              <button className=\"flex items-center space-x-1 px-3 py-1 text-sm text-slate-600 hover:text-slate-800\">\n                                <Copy className=\"h-4 w-4\" />\n                                <span>Copy</span>\n                              </button>\n                            </div>\n                          </div>\n                          \n                          <TranscriptView\n                            transcript={call.transcript as any}\n                            currentTime={currentAudioTime}\n                            onSeek={(time) => setCurrentAudioTime(time)}\n                            searchQuery={transcriptSearch}\n                          />\n                        </>\n                      ) : (\n                        <div className=\"text-center py-12\">\n                          <FileText className=\"mx-auto h-12 w-12 text-slate-400 mb-4\" />\n                          <h3 className=\"text-sm font-medium text-slate-900 mb-2\">No Transcript Available</h3>\n                          <p className=\"text-sm text-slate-500\">This call does not have a transcript available.</p>\n                        </div>\n                      )}\n                    </div>\n                  </div>\n                )}\n                \n                {/* Placeholder for other tabs */}\n                {activeTab === 'details' && (\n                  <div className=\"p-6\">\n                    <div className=\"bg-white rounded-lg p-6 shadow-sm\">\n                      <h3 className=\"text-lg font-medium text-slate-900 mb-4\">Technical Details</h3>\n                      {/* Implementation would include all technical metadata */}\n                      <p className=\"text-slate-500\">Technical details would be implemented here</p>\n                    </div>\n                  </div>\n                )}\n                \n                {activeTab === 'history' && (\n                  <div className=\"p-6\">\n                    <div className=\"bg-white rounded-lg p-6 shadow-sm\">\n                      <h3 className=\"text-lg font-medium text-slate-900 mb-4\">Contact History</h3>\n                      {/* Implementation would show related calls and interactions */}\n                      <p className=\"text-slate-500\">Contact history would be implemented here</p>\n                    </div>\n                  </div>\n                )}\n                \n                {activeTab === 'job' && (\n                  <div className=\"p-6\">\n                    <div className=\"bg-white rounded-lg p-6 shadow-sm\">\n                      <h3 className=\"text-lg font-medium text-slate-900 mb-4\">Job Information</h3>\n                      {call.jobId ? (\n                        <p className=\"text-slate-500\">Job details would be implemented here</p>\n                      ) : (\n                        <div className=\"text-center py-12\">\n                          <UserPlus className=\"mx-auto h-12 w-12 text-slate-400 mb-4\" />\n                          <h3 className=\"text-sm font-medium text-slate-900 mb-2\">No Job Created</h3>\n                          <p className=\"text-sm text-slate-500 mb-4\">Create a job from this call to schedule service.</p>\n                          <button\n                            onClick={handleCreateJob}\n                            className=\"px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors\"\n                          >\n                            Create Job\n                          </button>\n                        </div>\n                      )}\n                    </div>\n                  </div>\n                )}\n              </div>\n              \n              {/* Footer Actions */}\n              {triageMode && (\n                <div className=\"border-t bg-white px-6 py-4\">\n                  <div className=\"flex items-center justify-between\">\n                    <div className=\"flex items-center space-x-2\">\n                      {saving && (\n                        <div className=\"flex items-center space-x-2 text-sm text-slate-600\">\n                          <div className=\"w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin\"></div>\n                          <span>Saving...</span>\n                        </div>\n                      )}\n                    </div>\n                    \n                    <div className=\"flex items-center space-x-2\">\n                      <button\n                        onClick={onPrevious}\n                        disabled={!hasPrevious}\n                        className=\"flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors\"\n                      >\n                        <ChevronLeft className=\"h-4 w-4\" />\n                        <span>Previous</span>\n                      </button>\n                      \n                      <button\n                        onClick={() => isDispositionValid() ? (onAutoAdvance?.() || onNext?.()) : null}\n                        disabled={!hasNext || !isDispositionValid()}\n                        className={cn(\n                          \"flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded transition-colors\",\n                          isDispositionValid() \n                            ? \"text-white bg-blue-600 hover:bg-blue-700\" \n                            : \"text-slate-400 bg-slate-100 cursor-not-allowed\"\n                        )}\n                      >\n                        <span>Next Call</span>\n                        <ChevronRight className=\"h-4 w-4\" />\n                      </button>\n                    </div>\n                  </div>\n                </div>\n              )}\n            </>\n          ) : (\n            <div className=\"flex-1 flex items-center justify-center\">\n              <p className=\"text-slate-500\">Failed to load call details</p>\n            </div>\n          )}\n        </div>\n      </div>\n    </div>\n  );
}