// Database types based on the DDL from instructions

export interface Workspace {
  id: string;
  name: string;
  tz: string;
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
}

export interface WorkspaceUser {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'dispatcher' | 'tech' | 'viewer';
}

export interface Contact {
  id: string;
  workspace_id: string;
  name: string | null;
  phones: string[];
  email: string | null;
  address: Record<string, any> | null;
  notes: string | null;
  last_seen_at: Date | null;
  created_at: Date;
}

export interface Call {
  id: string;
  workspace_id: string;
  started_at: Date | null;
  ended_at: Date | null;
  duration_sec: number | null;
  direction: 'in' | 'out';
  from_e164: string | null;
  to_e164: string | null;
  contact_id: string | null;
  agent_type: 'ai' | 'human';
  intent: string | null;
  disposition: 'answered' | 'missed' | 'booked' | 'spam' | 'callback';
  value_est_cents: number | null;
  emergency_score: number | null;
  spam_score: number | null;
  recording_url: string | null;
  transcript_url: string | null;
  transcript: Record<string, any> | null;
  job_id: string | null;
  escalation_status: 'none' | 'queued' | 'sent' | 'acked';
  vendor_payload: Record<string, any> | null;
  created_at: Date;
}

export interface Job {
  id: string;
  workspace_id: string;
  title: string | null;
  status: 'new' | 'scheduled' | 'en_route' | 'on_site' | 'done' | 'cancelled';
  slot_start: Date | null;
  slot_end: Date | null;
  address: Record<string, any> | null;
  contact_id: string | null;
  source_call_id: string | null;
  assigned_to: string | null;
  estimate_cents: number | null;
  final_cents: number | null;
  checklist: Record<string, any> | null;
  photos: Record<string, any> | null;
  signature_url: string | null;
  calendar_event_id: string | null;
  notes: string | null;
  created_at: Date;
}

export interface Number {
  id: string;
  workspace_id: string;
  e164: string;
  label: string | null;
  status: 'active' | 'suspended';
  routing_mode: 'ai' | 'human' | 'overflow';
  hours: Record<string, any> | null;
  after_hours: 'ai' | 'vm' | 'forward';
  overflow_target: Record<string, any> | null;
  minute_budget_cap: number | null;
  recording_opt_in: boolean;
  a2p_brand_status: string | null;
  a2p_campaign_status: string | null;
  created_at: Date;
}

export interface AgentConfig {
  id: string;
  workspace_id: string;
  name: string | null;
  model: string | null;
  voice_id: string | null;
  temperature: number | null;
  system_prompt: string | null;
  safety_rules: Record<string, any> | null;
  escalation_rules: Record<string, any> | null;
  booking_rules: Record<string, any> | null;
  sop_bindings: string[];
  tools_enabled: string[];
  pii_redaction: boolean;
  version: number;
  status: 'draft' | 'published';
  created_at: Date;
}

export interface SOP {
  id: string;
  workspace_id: string;
  title: string | null;
  category: string | null;
  content_md: string | null;
  version: number;
  published: boolean;
  created_at: Date;
}

export interface AuditEvent {
  id: number;
  workspace_id: string | null;
  actor_type: string | null;
  actor_id: string | null;
  action: string | null;
  target_type: string | null;
  target_id: string | null;
  diff: Record<string, any> | null;
  ts: Date;
}

// Utility types for UI
export interface CallWithContact extends Call {
  contact?: Contact;
}

export interface CallWithJob extends Call {
  job?: Job;
}

export interface JobWithContact extends Job {
  contact?: Contact;
  source_call?: Call;
}

// Dashboard KPI types
export interface KPIData {
  answeredRatePct: number;
  bookings: number;
  missedValue: string;
  avgHandleTime: number;
}

export interface TrendData {
  answeredRatePct: { pct: number };
  bookings: { pct: number };
  missedValue: { pct: number };
  avgHandleTime: { pct: number };
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface LineChartDataPoint {
  time: string;
  answered: number;
  missed: number;
}

// Table data types
export interface CallTableRow {
  id: string;
  time: string;
  caller: string;
  intent: string;
  disposition: string;
  duration: string;
  recording?: string;
  value_est: string;
  agent_type: string;
  tags?: string[];
  source_number: string;
}

export interface JobTableRow {
  id: string;
  time_window: string;
  contact: string;
  address: string;
  status: string;
  tech: string;
  source: string;
  estimate: string;
}