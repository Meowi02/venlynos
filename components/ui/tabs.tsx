"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ value, onValueChange, children, className }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode; className?: string; }) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string; }) {
  return <div className={cn("flex gap-2", className)}>{children}</div>;
}

export function TabsTrigger({ value, children, className, ...props }: any) {
  return (
    <button
      data-value={value}
      className={cn("px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: any) {
  return <div className={cn("mt-3", className)}>{children}</div>;
}