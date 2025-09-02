import 'server-only';
import { db } from '../db';
import { subDays, format } from 'date-fns';

export interface KPIData {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  bookedJobs: number;
  totalValue: number;
  emergencyCalls: number;
  spamCalls: number;
  answerRate: number;
  bookingRate: number;
  avgCallValue: number;
}

export interface KPITrend {
  current: KPIData;
  previous: KPIData;
  periodLabel: string;
}

export interface CallsSeriesData {
  date: string;
  answered: number;
  missed: number;
  total: number;
}

export interface DispositionData {
  disposition: string;
  count: number;
  percentage: number;
}

export async function getKPIsForPeriod(
  workspaceId: string, 
  from: Date, 
  to: Date
): Promise<KPIData> {
  const calls = await db.call.findMany({
    where: {
      workspaceId,
      startedAt: {
        gte: from,
        lte: to,
      },
    },
    select: {
      disposition: true,
      intent: true,
      valueEstCents: true,
      emergencyScore: true,
      spamScore: true,
    },
  });

  const totalCalls = calls.length;
  const answeredCalls = calls.filter(c => c.disposition === 'answered').length;
  const missedCalls = calls.filter(c => c.disposition === 'missed').length;
  const bookedJobs = calls.filter(c => c.disposition === 'booked').length;
  const emergencyCalls = calls.filter(c => c.intent === 'emergency').length;
  const spamCalls = calls.filter(c => c.disposition === 'spam' || (c.spamScore ?? 0) > 80).length;

  const totalValue = calls.reduce((sum, call) => {
    if (call.disposition === 'spam' || (call.spamScore ?? 0) > 80) return sum;
    return sum + (call.valueEstCents ?? 0);
  }, 0);

  const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
  const bookingRate = answeredCalls > 0 ? (bookedJobs / answeredCalls) * 100 : 0;
  const avgCallValue = answeredCalls > 0 ? totalValue / answeredCalls : 0;

  return {
    totalCalls,
    answeredCalls,
    missedCalls,
    bookedJobs,
    totalValue,
    emergencyCalls,
    spamCalls,
    answerRate,
    bookingRate,
    avgCallValue,
  };
}

export async function getKPIsTrend(
  workspaceId: string, 
  days: number = 7
): Promise<KPITrend> {
  const now = new Date();
  const currentPeriodStart = subDays(now, days);
  const previousPeriodStart = subDays(currentPeriodStart, days);

  const [current, previous] = await Promise.all([
    getKPIsForPeriod(workspaceId, currentPeriodStart, now),
    getKPIsForPeriod(workspaceId, previousPeriodStart, currentPeriodStart),
  ]);

  return {
    current,
    previous,
    periodLabel: `Last ${days} days`,
  };
}

export async function getCallsTimeSeries(
  workspaceId: string, 
  days: number = 7
): Promise<CallsSeriesData[]> {
  const now = new Date();
  const startDate = subDays(now, days);

  const calls = await db.call.findMany({
    where: {
      workspaceId,
      startedAt: {
        gte: startDate,
        lte: now,
      },
    },
    select: {
      startedAt: true,
      disposition: true,
    },
  });

  // Group calls by date
  const callsByDate = new Map<string, { answered: number; missed: number; total: number }>();

  // Initialize all dates in range
  for (let i = 0; i < days; i++) {
    const date = format(subDays(now, i), 'yyyy-MM-dd');
    callsByDate.set(date, { answered: 0, missed: 0, total: 0 });
  }

  // Count calls by date and disposition
  calls.forEach(call => {
    const date = format(new Date(call.startedAt), 'yyyy-MM-dd');
    const existing = callsByDate.get(date) || { answered: 0, missed: 0, total: 0 };
    
    existing.total++;
    if (call.disposition === 'answered') {
      existing.answered++;
    } else if (call.disposition === 'missed') {
      existing.missed++;
    }
    
    callsByDate.set(date, existing);
  });

  return Array.from(callsByDate.entries())
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getDispositionBreakdown(
  workspaceId: string, 
  days: number = 7
): Promise<DispositionData[]> {
  const now = new Date();
  const startDate = subDays(now, days);

  const calls = await db.call.findMany({
    where: {
      workspaceId,
      startedAt: {
        gte: startDate,
        lte: now,
      },
      disposition: {
        not: null,
      },
    },
    select: {
      disposition: true,
    },
  });

  const dispositionCounts = new Map<string, number>();
  calls.forEach(call => {
    const count = dispositionCounts.get(call.disposition!) || 0;
    dispositionCounts.set(call.disposition!, count + 1);
  });

  const total = calls.length;

  return Array.from(dispositionCounts.entries()).map(([disposition, count]) => ({
    disposition,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
}

export async function getOverviewData(workspaceId: string) {
  const [kpisTrend, timeSeries, dispositions] = await Promise.all([
    getKPIsTrend(workspaceId),
    getCallsTimeSeries(workspaceId),
    getDispositionBreakdown(workspaceId),
  ]);

  return {
    kpis: kpisTrend,
    timeSeries,
    dispositions,
  };
}