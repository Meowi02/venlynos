'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { Container } from '@/components/shell/Container';
import { CommandPalette } from '@/components/command/CommandPalette';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="flex h-screen bg-slate-50">
        {/* Left rail - fixed */}
        <Sidebar />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 ml-64">
          {/* Top bar */}
          <Topbar />
          
          {/* Page content with floating container */}
          <main className="flex-1 overflow-auto p-6">
            <Container>
              {children}
            </Container>
          </main>
        </div>
      </div>
      
      {/* Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </>
  );
}