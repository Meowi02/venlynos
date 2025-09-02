'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KpiCard } from '@/components/overview/KpiCard';
import { LineChart } from '@/components/charts/LineChart';
import { Donut } from '@/components/charts/Donut';
import { Queues } from '@/components/overview/Queues';

interface OverviewData {
  kpis: {
    current: {
      totalCalls: number;
      answeredCalls: number;
      missedCalls: number;
      bookedJobs: number;
      totalValue: number;
      answerRate: number;
      bookingRate: number;
      avgCallValue: number;
    };
    previous: {
      totalCalls: number;
      answeredCalls: number;
      missedCalls: number;
      bookedJobs: number;
      totalValue: number;
      answerRate: number;
      bookingRate: number;
      avgCallValue: number;
    };
  };
  timeSeries: Array<{
    date: string;
    answered: number;
    missed: number;
    total: number;
  }>;
  dispositions: Array<{
    disposition: string;
    count: number;
    percentage: number;
  }>;
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      const response = await fetch('/api/analytics/overview');
      if (response.ok) {
        const overviewData = await response.json();
        setData(overviewData);
      }
    } catch (error) {
      console.error('Failed to load overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-slate-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-20 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
          <p className="text-slate-600">Dashboard overview</p>
        </div>
        <div className="text-center py-12">
          <p className="text-slate-500">Failed to load overview data</p>
        </div>
      </div>
    );
  }

  const dispositionChartData = data.dispositions.map(item => ({
    name: item.disposition,
    value: item.percentage,
    color: getDispositionColor(item.disposition),
  }));

  const timeSeriesChartData = data.timeSeries.map(item => ({
    ...item,
    date: item.date,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
        <p className="text-slate-600">Your operational dashboard</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Calls"
          value={data.kpis.current.totalCalls.toLocaleString()}
          trend={{
            ...calculateTrend(data.kpis.current.totalCalls, data.kpis.previous.totalCalls),
            label: 'vs last week',
          }}
          onClick={() => router.push('/calls')}
        />
        
        <KpiCard
          title="Answer Rate"
          value={formatPercentage(data.kpis.current.answerRate)}
          trend={{
            ...calculateTrend(data.kpis.current.answerRate, data.kpis.previous.answerRate),
            label: 'vs last week',
            isPositive: calculateTrend(data.kpis.current.answerRate, data.kpis.previous.answerRate).value >= 0,
          }}
          onClick={() => router.push('/calls?disposition=answered')}
        />
        
        <KpiCard
          title="Jobs Booked"
          value={data.kpis.current.bookedJobs.toLocaleString()}
          trend={{
            ...calculateTrend(data.kpis.current.bookedJobs, data.kpis.previous.bookedJobs),
            label: 'vs last week',
          }}
          onClick={() => router.push('/jobs')}
        />
        
        <KpiCard
          title="Total Value"
          value={formatCurrency(data.kpis.current.totalValue)}
          trend={{
            ...calculateTrend(data.kpis.current.totalValue, data.kpis.previous.totalValue),
            label: 'vs last week',
          }}
          onClick={() => router.push('/calls?disposition=booked')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calls Timeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Call Volume</h3>
          <LineChart
            data={timeSeriesChartData}
            lines={[
              { dataKey: 'total', name: 'Total', color: '#3B82F6' },
              { dataKey: 'answered', name: 'Answered', color: '#10B981' },
              { dataKey: 'missed', name: 'Missed', color: '#F59E0B' },
            ]}
            height={250}
          />
        </div>

        {/* Disposition Breakdown */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Call Outcomes</h3>
          <Donut
            data={dispositionChartData}
            height={250}
            showLegend={false}
          />
        </div>
      </div>

      {/* Action Queues */}
      <div>
        <h2 className="text-lg font-medium text-slate-900 mb-4">Action Required</h2>
        <Queues workspaceId="workspace_dev_123" />
      </div>
    </div>
  );
}

function getDispositionColor(disposition: string): string {
  const colors: Record<string, string> = {
    answered: '#10B981',
    missed: '#F59E0B', 
    booked: '#3B82F6',
    spam: '#EF4444',
    callback: '#8B5CF6',
  };
  return colors[disposition] || '#6B7280';
}