'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mic, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Mic className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">TranscribeAI</span>
            </Link>

            <div className="flex items-center space-x-1">
              <Link
                href="/"
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === '/'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <div className="flex items-center space-x-2">
                  <Mic className="w-4 h-4" />
                  <span>Record</span>
                </div>
              </Link>

              <Link
                href="/sessions"
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname?.startsWith('/sessions')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>History</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}