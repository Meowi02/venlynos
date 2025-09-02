"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export default function DrawerPanel({ open, onOpenChange, children, title }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode; title: string }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-soft p-4 focus:outline-none">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
            <button aria-label="Close" onClick={() => onOpenChange(false)} className="pill p-2">
              <X size={18} />
            </button>
          </div>
          <div className="py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

