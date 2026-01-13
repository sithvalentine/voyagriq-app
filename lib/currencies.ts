// Comprehensive list of world currencies with exchange rates
// Exchange rates are relative to USD (1 USD = X currency)
// In production, these should be fetched from a real-time API like exchangerate-api.com

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD
}

export const WORLD_CURRENCIES: Record<string, CurrencyInfo> = {
  // Major Currencies
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.50 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: 0.88 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.35 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rate: 1.63 },

  // Asia-Pacific
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 7.83 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.34 },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1305.00 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.12 },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 35.40 },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 4.68 },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', rate: 15650.00 },
  PHP: { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 55.80 },
  VND: { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 24350.00 },
  TWD: { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', rate: 31.45 },
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', rate: 278.50 },
  BDT: { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rate: 109.75 },
  LKR: { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', rate: 325.00 },
  NPR: { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs', rate: 133.00 },

  // Middle East
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.67 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', rate: 3.75 },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', rate: 3.64 },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', rate: 0.31 },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'ب.د', rate: 0.38 },
  OMR: { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', rate: 0.38 },
  ILS: { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', rate: 3.65 },
  JOD: { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', rate: 0.71 },
  LBP: { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', rate: 89500.00 },
  EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', rate: 30.90 },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 28.75 },
  IRR: { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', rate: 42000.00 },

  // Europe
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', rate: 10.45 },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', rate: 10.65 },
  DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', rate: 6.85 },
  PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', rate: 4.02 },
  CZK: { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', rate: 22.80 },
  HUF: { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', rate: 360.00 },
  RON: { code: 'RON', name: 'Romanian Leu', symbol: 'lei', rate: 4.56 },
  BGN: { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', rate: 1.80 },
  HRK: { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', rate: 6.93 },
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 92.50 },
  UAH: { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', rate: 37.25 },
  ISK: { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', rate: 138.00 },

  // Americas
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 17.15 },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 4.97 },
  ARS: { code: 'ARS', name: 'Argentine Peso', symbol: '$', rate: 350.00 },
  CLP: { code: 'CLP', name: 'Chilean Peso', symbol: '$', rate: 925.00 },
  COP: { code: 'COP', name: 'Colombian Peso', symbol: '$', rate: 3925.00 },
  PEN: { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', rate: 3.72 },
  UYU: { code: 'UYU', name: 'Uruguayan Peso', symbol: '$', rate: 39.20 },
  VES: { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.', rate: 36.25 },
  BOB: { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', rate: 6.91 },
  PYG: { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', rate: 7280.00 },
  JMD: { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', rate: 155.00 },
  TTD: { code: 'TTD', name: 'Trinidad & Tobago Dollar', symbol: 'TT$', rate: 6.79 },
  CRC: { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', rate: 525.00 },
  GTQ: { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', rate: 7.82 },

  // Africa
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18.65 },
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 775.00 },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 129.00 },
  GHS: { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', rate: 12.05 },
  TZS: { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 2505.00 },
  UGX: { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', rate: 3725.00 },
  MAD: { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', rate: 9.98 },
  TND: { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', rate: 3.12 },
  ETB: { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', rate: 55.50 },
  XAF: { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', rate: 603.00 },
  XOF: { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', rate: 603.00 },

  // Oceania
  FJD: { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', rate: 2.24 },
  PGK: { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', rate: 3.78 },
  WST: { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', rate: 2.75 },
  TOP: { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', rate: 2.36 },

  // Cryptocurrency (Optional - for modern travelers)
  BTC: { code: 'BTC', name: 'Bitcoin', symbol: '₿', rate: 0.000023 },
  ETH: { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', rate: 0.00044 },
};

// Helper function to get sorted currency list
export function getCurrencyList(): CurrencyInfo[] {
  return Object.values(WORLD_CURRENCIES).sort((a, b) => a.name.localeCompare(b.name));
}

// Helper function to get currency by code
export function getCurrency(code: string): CurrencyInfo | undefined {
  return WORLD_CURRENCIES[code];
}

// Convert amount from one currency to another
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;

  const from = getCurrency(fromCurrency);
  const to = getCurrency(toCurrency);

  if (!from || !to) {
    console.warn(`Currency not found: ${fromCurrency} or ${toCurrency}`);
    return amount;
  }

  // Convert to USD first (base currency)
  const usdAmount = amount / from.rate;

  // Then convert to target currency
  return usdAmount * to.rate;
}

// Format currency with symbol
export function formatCurrencyWithSymbol(amount: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode);
  if (!currency) {
    console.warn(`Currency not found: ${currencyCode}`);
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Convert from USD to target currency (assuming stored amounts are in USD)
  const convertedAmount = convertCurrency(amount, 'USD', currencyCode);

  return `${currency.symbol}${convertedAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// Export for backwards compatibility
export type Currency = string;
export const CURRENCY_SYMBOLS = Object.fromEntries(
  Object.entries(WORLD_CURRENCIES).map(([code, info]) => [code, info.symbol])
);
export const CURRENCY_RATES = Object.fromEntries(
  Object.entries(WORLD_CURRENCIES).map(([code, info]) => [code, info.rate])
);
