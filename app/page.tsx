"use client";

import StatCard from '@/components/StatCard';
import LineChart from '@/components/LineChart';
import Donut from '@/components/Donut';
import DataTable from '@/components/DataTable';
import IntentBadge from '@/components/IntentBadge';
import DispositionBadge from '@/components/DispositionBadge';
import SectionHeader from '@/components/SectionHeader';
import { intentMixTable, recentCallsPercentage, distributionData } from '@/lib/data';

// Updated KPIs to match target
const targetKpis = {
  answeredRatePct: 92,
  bookings: 37,
  missedValue: "28.40"
};

const targetTrends = {
  answeredRatePct: { pct: 2.1 },
  bookings: { pct: 12 },
  missedValue: { pct: -8.10 }
};

export default function OverviewPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-sm font-medium text-text-secondary">PlumbCo</h1>
          <div className="flex items-center gap-2 text-text-secondary">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">AD</span>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-text-primary">Welcome back, Admin</h2>
      </div>

      {/* KPI Cards + Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Answered Rate" 
          value={targetKpis.answeredRatePct} 
          suffix="%" 
          trend={targetTrends.answeredRatePct} 
        />
        <StatCard 
          title="Bookings" 
          value={targetKpis.bookings} 
          trend={targetTrends.bookings} 
        />
        <StatCard 
          title="Missed" 
          value={targetKpis.missedValue} 
          suffix="$" 
          trend={targetTrends.missedValue} 
        />
        <div className="venlyn-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Distribution</h3>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-text-tertiary rounded-full"></div>
              <div className="w-1 h-1 bg-text-tertiary rounded-full"></div>
              <div className="w-1 h-1 bg-text-tertiary rounded-full"></div>
            </div>
          </div>
          <Donut data={distributionData} ariaLabel="Call distribution" />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="venlyn-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Recent Calls</h3>
            <button className="px-4 py-2 text-sm font-medium text-text-secondary bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              Respite
            </button>
          </div>
          <LineChart data={recentCallsPercentage} ariaLabel="Recent calls percentage over time" />
        </div>
        
        <div className="venlyn-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Intent Mix</h3>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-text-tertiary rounded-full"></div>
              <div className="w-1 h-1 bg-text-tertiary rounded-full"></div>
              <div className="w-1 h-1 bg-text-tertiary rounded-full"></div>
            </div>
          </div>
          <DataTable
            columns={[
              { 
                header: 'Time', 
                accessorKey: 'time',
                cell: ({ row }) => (
                  <span className="text-sm font-medium text-text-primary">
                    {row.original.time}
                  </span>
                )
              },
              { 
                header: 'Intent', 
                accessorKey: 'intent', 
                cell: ({ row }) => <IntentBadge intent={row.original.intent} /> 
              },
              { 
                header: 'Disposition', 
                accessorKey: 'disposition', 
                cell: ({ row }) => <DispositionBadge disposition={row.original.disposition} /> 
              },
              { 
                header: 'Duration', 
                accessorKey: 'duration', 
                cell: ({ row }) => (
                  <span className="text-mono text-sm font-medium text-text-primary">
                    {row.original.duration}
                  </span>
                )
              }
            ]}
            data={intentMixTable}
          />
        </div>
      </div>
    </div>
  );
}