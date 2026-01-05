"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Currency } from '@/lib/currency';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  // Load currency preference from localStorage (client-side only to avoid hydration issues)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred_currency');
      if (saved && (saved === 'USD' || saved === 'EUR' || saved === 'GBP')) {
        setCurrencyState(saved);
      }
    }
  }, []);

  // Save currency preference to localStorage
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
