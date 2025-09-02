"use client";

import { Toaster } from '@/components/ui/toast';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

