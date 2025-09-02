// Intent and disposition types from database schema
export type Intent = 'emergency' | 'routine' | 'faq' | 'spam';
export type Disposition = 'answered' | 'missed' | 'booked' | 'callback';
export type CallDirection = 'in' | 'out';
export type AgentType = 'ai' | 'human';

export interface CallItem {
  id: string;
  started_at: string; // ISO
  ended_at?: string;
  duration_sec?: number;
  direction: CallDirection;
  from_e164: string;
  to_e164: string;
  caller_name?: string;
  intent?: Intent;
  disposition: Disposition;
  value_est_cents?: number;
  emergency_score?: number;
  spam_score?: number;
  agent_type: AgentType;
  recording_url?: string;
  transcript_url?: string;
  job_id?: string;
  escalation_status: 'none' | 'queued' | 'sent' | 'acked';
}

export interface JobItem {
  id: string;
  title: string;
  status: 'Scheduled' | 'InProgress' | 'Completed';
  date: string;
  address: string;
}

export interface NumberItem {
  id: string;
  e164: string;
  tag: 'treated' | 'holdout';
  monthlyCost: number;
  status: 'active' | 'paused';
}

// Deterministic PRNG for reproducible mock data
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

const intents: Intent[] = ['emergency', 'routine', 'faq', 'spam'];
const dispositions: Disposition[] = ['answered', 'missed', 'booked', 'callback'];
const agentTypes: AgentType[] = ['ai', 'human'];

const firstNames = ['Alex', 'Sam', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Riley'];
const lastNames = ['Smith', 'Lee', 'Patel', 'Garcia', 'Nguyen', 'Brown', "O'Neil"];

function name(): string {
  return `${pick(firstNames)} ${pick(lastNames)}`;
}

export const calls: CallItem[] = Array.from({ length: 160 }, (_, i) => {
  const daysAgo = Math.floor(rand() * 90);
  const time = new Date(Date.now() - daysAgo * 86400000 - Math.floor(rand() * 86400000));
  const intent = pick(intents);
  const disposition = pick(dispositions);
  const duration_sec = disposition === 'missed' ? undefined : Math.floor(rand() * 600) + 20;
  const value_est_cents = Math.floor(rand() * 90000) + (intent === 'emergency' ? 50000 : 5000);
  const agent_type = pick(agentTypes);
  const phoneNumbers = [
    '+15551234567', '+15559876543', '+15555555555', '+15551111111', '+15552222222'
  ];
  
  return {
    id: `c_${i}`,
    started_at: time.toISOString(),
    ended_at: duration_sec ? new Date(time.getTime() + duration_sec * 1000).toISOString() : undefined,
    duration_sec,
    direction: 'in' as CallDirection,
    from_e164: `+1555${Math.floor(1000000 + rand() * 9000000)}`,
    to_e164: pick(phoneNumbers),
    caller_name: name(),
    intent,
    disposition,
    value_est_cents,
    emergency_score: intent === 'emergency' ? Math.floor(rand() * 3) + 8 : Math.floor(rand() * 5),
    spam_score: intent === 'spam' ? Math.floor(rand() * 3) + 8 : Math.floor(rand() * 4),
    agent_type,
    recording_url: `https://example.com/rec/${i}.mp3`,
    transcript_url: `https://example.com/transcript/${i}.txt`,
    job_id: disposition === 'booked' ? `j_${Math.floor(rand() * 50)}` : undefined,
    escalation_status: Math.random() < 0.1 ? pick(['queued', 'sent', 'acked'] as const) : 'none'
  };
});

export const jobs: JobItem[] = Array.from({ length: 18 }, (_, i) => {
  const status = pick(['Scheduled', 'InProgress', 'Completed'] as const);
  const date = new Date(Date.now() + Math.floor(rand() * 14 - 7) * 86400000);
  return {
    id: `j_${i}`,
    title: `${pick(['Repair', 'Install', 'Check'])} ${pick(['HVAC', 'Heater', 'Pump'])}`,
    status,
    date: date.toISOString(),
    address: `${Math.floor(rand() * 900 + 100)} ${pick(['Maple', 'Oak', 'Pine', 'Cedar'])} St.`
  };
});

export const numbers: NumberItem[] = Array.from({ length: 10 }, (_, i) => {
  return {
    id: `n_${i}`,
    e164: `+1${Math.floor(2000000000 + rand() * 7000000000)}`,
    tag: pick(['treated', 'holdout'] as const),
    monthlyCost: Math.floor(rand() * 15) + 5,
    status: pick(['active', 'paused'] as const)
  };
});

// Metrics  
export const kpis = {
  answeredRatePct: 84,
  bookings: 126,
  missedValue: 18250,
  avgHandleSec: 214
};

export const kpiTrends = {
  answeredRatePct: { pct: 2.3 },
  bookings: { pct: 12.5 },
  missedValue: { pct: -8.1 },
  avgHandleSec: { pct: -1.2 }
};

// Recent Calls line chart (monthly points)
export const recentCallsSeries = Array.from({ length: 12 }, (_, m) => ({
  month: new Date(2024, m, 1).toLocaleString('en-US', { month: 'short' }),
  count: Math.floor(80 + rand() * 60)
}));

// Donut Status Mix
export const statusMix = [
  { name: 'Answered', value: calls.filter((c) => c.disposition === 'answered').length },
  { name: 'Missed', value: calls.filter((c) => c.disposition === 'missed').length },
  { name: 'FAQ', value: calls.filter((c) => c.intent === 'faq').length }
];

export const intentMixTable = [
  { time: '11:23am', intent: 'emergency', disposition: 'answered', duration: '7:16' },
  { time: '11:15am', intent: 'routine', disposition: 'answered', duration: '3:42' },
  { time: '11:08am', intent: 'routine', disposition: 'missed', duration: 'AM2' },
  { time: '10:58am', intent: 'spam', disposition: 'answered', duration: 'AM' },
  { time: '10:42am', intent: 'spam', disposition: 'answered', duration: '00' }
];

// Recent Calls percentage data to match target
export const recentCallsPercentage = [
  { month: 'Jan', percentage: 65 },
  { month: 'Feb', percentage: 72 },
  { month: 'Mar', percentage: 68 },
  { month: 'Apr', percentage: 70 },
  { month: 'May', percentage: 78 },
  { month: 'Jun', percentage: 83 },
  { month: 'Jul', percentage: 88 }
];

// Distribution data for the donut chart
export const distributionData = [
  { name: 'Answered', value: 65 },
  { name: 'FAQ', value: 20 },
  { name: 'Other', value: 15 }
];

