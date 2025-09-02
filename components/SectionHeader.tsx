"use client";
import * as React from 'react';

export default function SectionHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-gray-900 tracking-tight">{title}</h2>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

