"use client";

import * as Drawer from '@radix-ui/react-dialog';
import { useState } from 'react';

export default function Jarvis() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');

  function run(action: string) {
    console.log('Jarvis:', action);
    alert(`${action} executed`);
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <button
        aria-label="Open Jarvis"
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 pill px-4 py-3 shadow-soft bg-white"
      >
        Jarvis
      </button>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/20" />
        <Drawer.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-soft p-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <Drawer.Title className="text-base font-semibold">Jarvis</Drawer.Title>
            <Drawer.Close asChild>
              <button className="pill px-3 py-1">Close</button>
            </Drawer.Close>
          </div>
          <div className="space-y-4 py-4">
            <input
              className="w-full pill px-3 py-2 text-sm"
              placeholder="How can I help?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              {['Change hours', 'Swap escalation', 'Toggle overflow', 'Export last 7d calls'].map((a) => (
                <button key={a} className="pill px-3 py-2 text-sm" onClick={() => run(a)}>
                  {a}
                </button>
              ))}
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Last clips</div>
              <ul className="space-y-2 text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="pill px-3 py-2">Clip #{i + 1}</li>
                ))}
              </ul>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

