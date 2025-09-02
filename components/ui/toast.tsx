"use client";

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  return (
    <ToastPrimitives.Provider swipeDirection="right">
      <ToastViewport />
    </ToastPrimitives.Provider>
  );
}

export function useToast() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const toast = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  };
  return { toast, Toast: () => (
    <ToastPrimitives.Root open={open} onOpenChange={setOpen} className={cn('pill bg-white text-ink px-4 py-3 shadow-soft')}> 
      <ToastPrimitives.Title className="text-sm font-medium">{message}</ToastPrimitives.Title>
    </ToastPrimitives.Root>
  )};
}

function ToastViewport() {
  return (
    <ToastPrimitives.Viewport className="fixed top-4 right-4 z-[100] flex max-w-[360px] flex-col gap-2" />
  );
}

