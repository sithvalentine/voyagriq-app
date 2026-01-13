"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrency } from '@/lib/currencies';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('USD');

  // Load currency preference from localStorage (client-side only to avoid hydration issues)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred_currency');
      // Validate that the currency exists in our system
      if (saved && getCurrency(saved)) {
        setCurrencyState(saved);
      }
    }
  }, []);

  // Save currency preference to localStorage
  const setCurrency = (newCurrency: string) => {
    // Validate currency before setting
    if (getCurrency(newCurrency)) {
      setCurrencyState(newCurrency);
      localStorage.setItem('preferred_currency', newCurrency);
    } else {
      console.warn(`Invalid currency code: ${newCurrency}`);
    }
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
