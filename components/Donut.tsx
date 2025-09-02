"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#10B981', '#EF4444', '#9CA3AF']; // Green, Red, Gray matching screenshot

interface DonutProps {
  data: { name: string; value: number }[];
  ariaLabel: string;
}

export default function Donut({ data, ariaLabel }: DonutProps) {
  const total = data.reduce((a, b) => a + b.value, 0);
  
  return (
    <div role="img" aria-label={ariaLabel} className="w-full">
      <div className="flex items-center justify-center">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie 
              data={data} 
              innerRadius={65} 
              outerRadius={85} 
              paddingAngle={3} 
              dataKey="value" 
              nameKey="name"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Custom Legend */}
        <div className="ml-6 space-y-3">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-text-primary">{entry.name}</span>
                <span className="text-xs text-text-secondary">
                  {entry.value} ({Math.round((entry.value / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

