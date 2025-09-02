"use client";

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';

export default function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border">
              {hg.headers.map((header) => (
                <th key={header.id} className="text-left px-0 py-3 text-sm font-semibold text-text-primary">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={`${index !== table.getRowModel().rows.length - 1 ? 'border-b border-border' : ''} hover:bg-gray-50/50 transition-colors cursor-pointer`}
              onClick={() => onRowClick?.(row.original as TData)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-0 py-4 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

