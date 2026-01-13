// This file is kept for backwards compatibility
// All currency functionality has been moved to lib/currencies.ts

export {
  CURRENCY_RATES,
  CURRENCY_SYMBOLS,
  type Currency,
  convertCurrency,
  formatCurrencyWithSymbol,
  getCurrency,
  getCurrencyList,
  type CurrencyInfo,
  WORLD_CURRENCIES
} from './currencies';
