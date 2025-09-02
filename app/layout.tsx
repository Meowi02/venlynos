import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import Sidebar from '@/components/Sidebar';
import Jarvis from '@/components/Jarvis';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
});

const mono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'VenlynOps',
  description: 'Operational dashboard for VenlynOps',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-canvas text-text-primary antialiased font-sans">
        <Providers>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main content area */}
            <div className="flex-1 ml-[272px]">
              {/* Page content */}
              <main className="min-h-screen">
                <div className="p-8 min-h-screen">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </div>
              </main>
            </div>
          </div>
          
          {/* Global Jarvis component */}
          <Jarvis />
        </Providers>
      </body>
    </html>
  );
}

