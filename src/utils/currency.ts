/**
 * Multi-Currency Support System
 * Handles currency conversion, formatting, and exchange rates
 */

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  decimals: number;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', decimals: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', decimals: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', decimals: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', decimals: 2 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', decimals: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', decimals: 2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', decimals: 2 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰', decimals: 2 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷', decimals: 0 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', decimals: 2 },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', flag: '🇲🇽', decimals: 2 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', decimals: 2 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪', decimals: 2 },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦', decimals: 2 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺', decimals: 2 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷', decimals: 2 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪', decimals: 2 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴', decimals: 2 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰', decimals: 2 },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱', decimals: 2 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭', decimals: 2 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩', decimals: 0 },
];

// Simulated exchange rates (in production, these would come from an API)
const BASE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  INR: 83.12,
  SGD: 1.34,
  HKD: 7.82,
  KRW: 1315.50,
  BRL: 4.97,
  MXN: 17.08,
  ZAR: 18.65,
  AED: 3.67,
  SAR: 3.75,
  RUB: 92.50,
  TRY: 32.15,
  SEK: 10.38,
  NOK: 10.52,
  DKK: 6.87,
  PLN: 3.98,
  THB: 35.42,
  IDR: 15680.0,
};

export class CurrencyManager {
  private static instance: CurrencyManager;
  private exchangeRates: Map<string, ExchangeRate[]> = new Map();
  private baseCurrency: string = 'USD';
  private lastUpdate: Date = new Date();

  private constructor() {
    this.loadSettings();
    this.initializeRates();
  }

  static getInstance(): CurrencyManager {
    if (!CurrencyManager.instance) {
      CurrencyManager.instance = new CurrencyManager();
    }
    return CurrencyManager.instance;
  }

  /**
   * Load currency settings from localStorage
   */
  private loadSettings(): void {
    const stored = localStorage.getItem('currency-settings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        this.baseCurrency = settings.baseCurrency || 'USD';
      } catch (e) {
        console.error('Error loading currency settings:', e);
      }
    }
  }

  /**
   * Save currency settings to localStorage
   */
  private saveSettings(): void {
    localStorage.setItem('currency-settings', JSON.stringify({
      baseCurrency: this.baseCurrency,
      lastUpdate: this.lastUpdate.toISOString()
    }));
  }

  /**
   * Initialize exchange rates (simulated)
   */
  private initializeRates(): void {
    // In production, this would fetch from a real API like:
    // - ExchangeRate-API
    // - Open Exchange Rates
    // - Fixer.io
    // - European Central Bank API

    Object.keys(BASE_RATES).forEach(from => {
      const rates: ExchangeRate[] = [];
      Object.keys(BASE_RATES).forEach(to => {
        if (from !== to) {
          rates.push({
            from,
            to,
            rate: BASE_RATES[to] / BASE_RATES[from],
            timestamp: new Date()
          });
        }
      });
      this.exchangeRates.set(from, rates);
    });

    this.lastUpdate = new Date();
  }

  /**
   * Get the base currency
   */
  getBaseCurrency(): string {
    return this.baseCurrency;
  }

  /**
   * Set the base currency
   */
  setBaseCurrency(currencyCode: string): void {
    if (SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)) {
      this.baseCurrency = currencyCode;
      this.saveSettings();
      window.dispatchEvent(new CustomEvent('currencyChanged', {
        detail: { currency: currencyCode }
      }));
    }
  }

  /**
   * Get currency by code
   */
  getCurrency(code: string): Currency | undefined {
    return SUPPORTED_CURRENCIES.find(c => c.code === code);
  }

  /**
   * Get exchange rate between two currencies
   */
  getExchangeRate(from: string, to: string): number {
    if (from === to) return 1.0;

    const rates = this.exchangeRates.get(from);
    if (!rates) return 1.0;

    const rate = rates.find(r => r.to === to);
    return rate ? rate.rate : 1.0;
  }

  /**
   * Convert amount from one currency to another
   */
  convert(amount: number, from: string, to: string): number {
    if (from === to) return amount;
    const rate = this.getExchangeRate(from, to);
    return amount * rate;
  }

  /**
   * Convert amount to base currency
   */
  toBaseCurrency(amount: number, from: string): number {
    return this.convert(amount, from, this.baseCurrency);
  }

  /**
   * Convert amount from base currency
   */
  fromBaseCurrency(amount: number, to: string): number {
    return this.convert(amount, this.baseCurrency, to);
  }

  /**
   * Format amount in specific currency
   */
  format(amount: number, currencyCode: string, options?: {
    showSymbol?: boolean;
    showCode?: boolean;
  }): string {
    const currency = this.getCurrency(currencyCode);
    if (!currency) return amount.toFixed(2);

    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals
    });

    const showSymbol = options?.showSymbol !== false;
    const showCode = options?.showCode || false;

    if (showSymbol && showCode) {
      return `${currency.symbol}${formatted} ${currency.code}`;
    } else if (showSymbol) {
      return `${currency.symbol}${formatted}`;
    } else if (showCode) {
      return `${formatted} ${currency.code}`;
    }

    return formatted;
  }

  /**
   * Format amount in base currency
   */
  formatBase(amount: number, options?: {
    showSymbol?: boolean;
    showCode?: boolean;
  }): string {
    return this.format(amount, this.baseCurrency, options);
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): Currency[] {
    return SUPPORTED_CURRENCIES;
  }

  /**
   * Refresh exchange rates (simulated)
   */
  async refreshRates(): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add small random fluctuation to simulate real-time changes
    Object.keys(BASE_RATES).forEach(from => {
      const rates = this.exchangeRates.get(from) || [];
      rates.forEach(rate => {
        // Fluctuate by ±0.5%
        const fluctuation = 1 + (Math.random() - 0.5) * 0.01;
        rate.rate *= fluctuation;
        rate.timestamp = new Date();
      });
    });

    this.lastUpdate = new Date();
    window.dispatchEvent(new CustomEvent('exchangeRatesUpdated'));
  }

  /**
   * Get last update timestamp
   */
  getLastUpdate(): Date {
    return this.lastUpdate;
  }

  /**
   * Get popular currency pairs
   */
  getPopularPairs(): Array<{ from: string; to: string; rate: number }> {
    const pairs = [
      { from: 'USD', to: 'EUR' },
      { from: 'USD', to: 'GBP' },
      { from: 'USD', to: 'JPY' },
      { from: 'EUR', to: 'GBP' },
      { from: 'GBP', to: 'USD' },
    ];

    return pairs.map(pair => ({
      ...pair,
      rate: this.getExchangeRate(pair.from, pair.to)
    }));
  }

  /**
   * Calculate total in multiple currencies
   */
  calculateMultiCurrency(items: Array<{ amount: number; currency: string }>): Map<string, number> {
    const totals = new Map<string, number>();

    items.forEach(item => {
      const current = totals.get(item.currency) || 0;
      totals.set(item.currency, current + item.amount);
    });

    return totals;
  }

  /**
   * Convert all amounts to base currency and sum
   */
  sumInBaseCurrency(items: Array<{ amount: number; currency: string }>): number {
    return items.reduce((sum, item) => {
      return sum + this.toBaseCurrency(item.amount, item.currency);
    }, 0);
  }
}

// Singleton instance
export const currencyManager = CurrencyManager.getInstance();

// Helper functions for easy access
export const getCurrency = (code: string) => currencyManager.getCurrency(code);
export const convertCurrency = (amount: number, from: string, to: string) =>
  currencyManager.convert(amount, from, to);
export const formatCurrency = (amount: number, currency: string, options?: any) =>
  currencyManager.format(amount, currency, options);
export const getBaseCurrency = () => currencyManager.getBaseCurrency();
export const setBaseCurrency = (code: string) => currencyManager.setBaseCurrency(code);
