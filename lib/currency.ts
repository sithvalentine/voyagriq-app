// Currency conversion rates (example rates - in production, use a real API)
export const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.92,  // 1 USD = 0.92 EUR
  GBP: 0.79,  // 1 USD = 0.79 GBP
};

export type Currency = 'USD' | 'EUR' | 'GBP';

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return amount;

  // Convert to USD first (base currency)
  const usdAmount = amount / CURRENCY_RATES[fromCurrency];

  // Then convert to target currency
  return usdAmount * CURRENCY_RATES[toCurrency];
}

export function formatCurrencyWithSymbol(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const convertedAmount = convertCurrency(amount, 'USD', currency);
  return `${symbol}${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
