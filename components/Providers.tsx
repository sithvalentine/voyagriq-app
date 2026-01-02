"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { TierProvider } from '@/contexts/TierContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TierProvider>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </TierProvider>
    </AuthProvider>
  );
}
