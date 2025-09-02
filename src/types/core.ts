import { z } from 'zod';

// Enums and unions
export type CallDisposition = 'answered' | 'missed' | 'booked' | 'spam' | 'callback';
export type AgentType = 'ai' | 'human';
export type JobStatus = 'new' | 'scheduled' | 'en_route' | 'on_site' | 'done' | 'cancelled';
export type Intent = 'emergency' | 'routine' | 'quote' | 'faq' | 'billing' | 'spam';
export type CallDirection = 'in' | 'out';
export type EscalationStatus = 'none' | 'queued' | 'sent' | 'acked';
export type NumberStatus = 'active' | 'suspended';
export type RoutingMode = 'ai' | 'human' | 'overflow';
export type AfterHoursMode = 'ai' | 'vm' | 'forward';

// New enums from database schema
export type QueueStatus = 'none' | 'triage' | 'followup';
export type CallSource = 'phone' | 'web_callback' | 'manual' | 'transfer';
export type LeadSource = 'google_maps' | 'website' | 'referral' | 'ad' | 'unknown';
export type SpamReason = 'robocall' | 'telemarketer' | 'repeat_silent';
export type PreferredChannel = 'call' | 'sms' | 'email';
export type FollowUpType = 'callback' | 'sms' | 'email' | 'task';
export type FollowUpStatus = 'open' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

// Core interfaces
export interface Contact {
  id: string;
  workspaceId: string;
  name?: string;
  phones: string[];
  email?: string;
  address?: any;
  notes?: string;
  lastSeenAt?: string;
  doNotContact: boolean;
  preferredChannel?: PreferredChannel;
  timeWindows: any[]; // array of {day:'Mon',start:'08:00',end:'18:00'}
  createdAt: string;
}

export interface Call {
  id: string;
  workspaceId: string;
  startedAt: string;
  endedAt?: string;
  durationSec?: number;
  direction: CallDirection;
  fromE164: string;
  toE164: string;
  contactId?: string;
  agentType: AgentType;
  intent?: Intent;
  disposition?: CallDisposition;
  valueEstCents?: number;
  emergencyScore?: number;
  spamScore?: number;
  recordingUrl?: string;
  transcriptUrl?: string;
  transcript?: any;
  jobId?: string;
  escalationStatus?: EscalationStatus;
  // New fields from spec
  queueStatus: QueueStatus;
  outcomeRequired: boolean;
  outcomeAt?: string;
  source: CallSource;
  leadSource: LeadSource;
  tags: string[];
  consent?: any; // {recording:boolean; smsOptIn:boolean; lastUpdated:datetime}
  doNotContact: boolean;
  followUps: any[]; // array of follow-up objects
  attachments: any[]; // array of attachment objects
  carrierInfo?: any; // {carrier:string?, lineType:'mobile'|'landline'|'voip'|'unknown'}
  spamReason?: SpamReason;
  createdAt: string;
}

export interface Job {
  id: string;
  workspaceId: string;
  title?: string;
  status: JobStatus;
  slotStart?: string;
  slotEnd?: string;
  address?: any;
  contactId?: string;
  sourceCallId?: string;
  assignedTo?: string;
  estimateCents?: number;
  finalCents?: number;
  checklist?: any;
  photos?: any;
  createdAt: string;
  updatedAt: string;
}

export interface NumberCfg {
  id: string;
  workspaceId: string;
  e164: string;
  label?: string;
  status: NumberStatus;
  routingMode: RoutingMode;
  hours: any;
  afterHours: AfterHoursMode;
  overflowTarget?: any;
  minuteBudgetCap?: number;
  recordingOptIn: boolean;
  a2pBrandStatus?: string;
  a2pCampaignStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  id: string;
  workspaceId: string;
  name: string;
  version: number;
  isActive: boolean;
  runtime: any;
  tools: any;
  prompts: any;
  policies: any;
  escalation: any;
  bookingRules: any;
  createdAt: string;
  updatedAt: string;
}

export interface SOP {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  version: number;
  isPublished: boolean;
  agentConfigs: any;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpTask {
  id: string;
  workspaceId: string;
  callId?: string;
  contactId?: string;
  type: FollowUpType;
  dueAt: string;
  assignedTo?: string;
  status: FollowUpStatus;
  priority: TaskPriority;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  workspaceId: string;
  actor: string;
  action: string;
  target: string;
  targetId: string;
  diff?: any;
  metadata?: any;
  createdAt: string;
}

// Zod schemas for validation
export const callDispositionSchema = z.enum(['answered', 'missed', 'booked', 'spam', 'callback']);
export const agentTypeSchema = z.enum(['ai', 'human']);
export const jobStatusSchema = z.enum(['new', 'scheduled', 'en_route', 'on_site', 'done', 'cancelled']);
export const intentSchema = z.enum(['emergency', 'routine', 'quote', 'faq', 'billing', 'spam']);
export const callDirectionSchema = z.enum(['in', 'out']);
export const escalationStatusSchema = z.enum(['none', 'queued', 'sent', 'acked']);
export const numberStatusSchema = z.enum(['active', 'suspended']);
export const routingModeSchema = z.enum(['ai', 'human', 'overflow']);
export const afterHoursModeSchema = z.enum(['ai', 'vm', 'forward']);

// New schemas from spec
export const queueStatusSchema = z.enum(['none', 'triage', 'followup']);
export const callSourceSchema = z.enum(['phone', 'web_callback', 'manual', 'transfer']);
export const leadSourceSchema = z.enum(['google_maps', 'website', 'referral', 'ad', 'unknown']);
export const spamReasonSchema = z.enum(['robocall', 'telemarketer', 'repeat_silent']);
export const preferredChannelSchema = z.enum(['call', 'sms', 'email']);
export const followUpTypeSchema = z.enum(['callback', 'sms', 'email', 'task']);
export const followUpStatusSchema = z.enum(['open', 'done']);
export const taskPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

export const contactSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string().optional(),
  phones: z.array(z.string()),
  email: z.string().email().optional(),
  address: z.any().optional(),
  notes: z.string().optional(),
  lastSeenAt: z.string().datetime().optional(),
  doNotContact: z.boolean(),
  preferredChannel: preferredChannelSchema.optional(),
  timeWindows: z.array(z.any()),
  createdAt: z.string().datetime(),
});

export const callSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  durationSec: z.number().int().optional(),
  direction: callDirectionSchema,
  fromE164: z.string(),
  toE164: z.string(),
  contactId: z.string().optional(),
  agentType: agentTypeSchema,
  intent: intentSchema.optional(),
  disposition: callDispositionSchema.optional(),
  valueEstCents: z.number().int().optional(),
  emergencyScore: z.number().int().optional(),
  spamScore: z.number().int().optional(),
  recordingUrl: z.string().url().optional(),
  transcriptUrl: z.string().url().optional(),
  transcript: z.any().optional(),
  jobId: z.string().optional(),
  escalationStatus: escalationStatusSchema.optional(),
  // New fields from spec
  queueStatus: queueStatusSchema,
  outcomeRequired: z.boolean(),
  outcomeAt: z.string().datetime().optional(),
  source: callSourceSchema,
  leadSource: leadSourceSchema,
  tags: z.array(z.string()),
  consent: z.any().optional(),
  doNotContact: z.boolean(),
  followUps: z.array(z.any()),
  attachments: z.array(z.any()),
  carrierInfo: z.any().optional(),
  spamReason: spamReasonSchema.optional(),
  createdAt: z.string().datetime(),
});

export const jobSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  title: z.string().optional(),
  status: jobStatusSchema,
  slotStart: z.string().datetime().optional(),
  slotEnd: z.string().datetime().optional(),
  address: z.any().optional(),
  contactId: z.string().optional(),
  sourceCallId: z.string().optional(),
  assignedTo: z.string().optional(),
  estimateCents: z.number().int().optional(),
  finalCents: z.number().int().optional(),
  checklist: z.any().optional(),
  photos: z.any().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const numberCfgSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  e164: z.string(),
  label: z.string().optional(),
  status: numberStatusSchema,
  routingMode: routingModeSchema,
  hours: z.any(),
  afterHours: afterHoursModeSchema,
  overflowTarget: z.any().optional(),
  minuteBudgetCap: z.number().int().optional(),
  recordingOptIn: z.boolean(),
  a2pBrandStatus: z.string().optional(),
  a2pCampaignStatus: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const agentConfigSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  version: z.number().int(),
  isActive: z.boolean(),
  runtime: z.any(),
  tools: z.any(),
  prompts: z.any(),
  policies: z.any(),
  escalation: z.any(),
  bookingRules: z.any(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const sopSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  title: z.string(),
  content: z.string(),
  version: z.number().int(),
  isPublished: z.boolean(),
  agentConfigs: z.any(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const followUpTaskSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  callId: z.string().optional(),
  contactId: z.string().optional(),
  type: followUpTypeSchema,
  dueAt: z.string().datetime(),
  assignedTo: z.string().optional(),
  status: followUpStatusSchema,
  priority: taskPrioritySchema,
  note: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const auditEventSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  actor: z.string(),
  action: z.string(),
  target: z.string(),
  targetId: z.string(),
  diff: z.any().optional(),
  metadata: z.any().optional(),
  createdAt: z.string().datetime(),
});

// Input schemas for API endpoints
export const createContactSchema = contactSchema.omit({ id: true, createdAt: true });
export const updateContactSchema = createContactSchema.partial();

export const createCallSchema = callSchema.omit({ id: true, createdAt: true });
export const updateCallSchema = createCallSchema.partial();

export const createJobSchema = jobSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateJobSchema = createJobSchema.partial();

export const createNumberCfgSchema = numberCfgSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateNumberCfgSchema = createNumberCfgSchema.partial();

export const createFollowUpTaskSchema = followUpTaskSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const updateFollowUpTaskSchema = createFollowUpTaskSchema.partial();