"use client";

import { LineChart as RLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface LineChartProps {
  data: { month: string; count?: number; percentage?: number }[];
  ariaLabel: string;
}

export default function LineChart({ data, ariaLabel }: LineChartProps) {
  const dataKey = data[0]?.percentage !== undefined ? 'percentage' : 'count';
  const isPercentage = dataKey === 'percentage';
  
  return (
    <div role="img" aria-label={ariaLabel} className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <RLineChart data={data} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
          <CartesianGrid 
            stroke="#E2E8F0" 
            strokeDasharray="2 2" 
            horizontal={true}
            vertical={false}
          />
          <XAxis 
            dataKey="month" 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: 12, fill: '#64748B' }}
            dy={10}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            width={50}
            domain={isPercentage ? [0, 100] : ['auto', 'auto']}
            tickFormatter={(value) => isPercentage ? `${value}%` : value}
            tick={{ fontSize: 12, fill: '#64748B' }}
          />
          <Tooltip 
            cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-blue-600">
                      {`${payload[0]?.value}${isPercentage ? '%' : ''}`}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke="#3B82F6" 
            strokeWidth={2.5} 
            dot={{ fill: '#3B82F6', strokeWidth: 0, r: 5 }} 
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }} 
          />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}

