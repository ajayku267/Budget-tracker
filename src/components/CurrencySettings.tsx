import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  DollarSign,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { currencyManager, SUPPORTED_CURRENCIES, Currency } from '../utils/currency';

export function CurrencySettings() {
  const [baseCurrency, setBaseCurrency] = useState(currencyManager.getBaseCurrency());
  const [lastUpdate, setLastUpdate] = useState(currencyManager.getLastUpdate());
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleCurrencyChanged = () => {
      setBaseCurrency(currencyManager.getBaseCurrency());
    };

    const handleRatesUpdated = () => {
      setLastUpdate(currencyManager.getLastUpdate());
    };

    window.addEventListener('currencyChanged', handleCurrencyChanged);
    window.addEventListener('exchangeRatesUpdated', handleRatesUpdated);

    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChanged);
      window.removeEventListener('exchangeRatesUpdated', handleRatesUpdated);
    };
  }, []);

  const handleCurrencyChange = (currencyCode: string) => {
    currencyManager.setBaseCurrency(currencyCode);
    setBaseCurrency(currencyCode);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRefreshRates = async () => {
    setRefreshing(true);
    await currencyManager.refreshRates();
    setLastUpdate(currencyManager.getLastUpdate());
    setRefreshing(false);
  };

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(currency =>
    currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularPairs = currencyManager.getPopularPairs();
  const selectedCurrency = currencyManager.getCurrency(baseCurrency);

  return (
    <div className="space-y-6">
      {/* Current Base Currency */}
      <Card className="card-hover bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{selectedCurrency?.flag}</div>
              <div>
                <p className="text-blue-100 text-sm mb-1">Base Currency</p>
                <h2 className="text-3xl font-bold">{selectedCurrency?.code}</h2>
                <p className="text-blue-100 mt-1">{selectedCurrency?.name}</p>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Globe className="h-6 w-6" />
            </div>
          </div>
          {showSuccess && (
            <div className="mt-4 p-3 bg-success-500/20 rounded-lg flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5" />
              <span>Base currency updated successfully!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exchange Rates Status */}
      <Card className="card-hover">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-semibold">
                  {lastUpdate.toLocaleString('default', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefreshRates}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Rates
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Popular Exchange Rates */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Popular Exchange Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {popularPairs.map((pair, index) => {
              const fromCurrency = currencyManager.getCurrency(pair.from);
              const toCurrency = currencyManager.getCurrency(pair.to);
              const isUp = Math.random() > 0.5; // Simulated trend

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-2xl">
                      <span>{fromCurrency?.flag}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span>{toCurrency?.flag}</span>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {pair.from}/{pair.to}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        1 {pair.from} = {pair.rate.toFixed(4)} {pair.to}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUp ? (
                      <div className="flex items-center gap-1 text-success">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">+0.{Math.floor(Math.random() * 9)}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-error">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm font-medium">-0.{Math.floor(Math.random() * 9)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Currency Selector */}
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Select Base Currency
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredCurrencies.length} currencies
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <Input
            type="text"
            placeholder="Search currencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          {/* Currency Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-auto custom-scrollbar">
            {filteredCurrencies.map((currency) => {
              const isSelected = currency.code === baseCurrency;

              return (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2'
                      : 'bg-muted/50 hover:bg-muted hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{currency.flag}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>
                  <p className={`font-bold text-lg ${isSelected ? '' : 'text-foreground'}`}>
                    {currency.code}
                  </p>
                  <p className={`text-sm ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {currency.name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-sm font-medium ${isSelected ? '' : 'text-foreground'}`}>
                      {currency.symbol}
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {currency.decimals} decimals
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredCurrencies.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground">No currencies found</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency Converter */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Quick Currency Converter</CardTitle>
        </CardHeader>
        <CardContent>
          <QuickConverter baseCurrency={baseCurrency} />
        </CardContent>
      </Card>
    </div>
  );
}

// Quick Converter Component
function QuickConverter({ baseCurrency }: { baseCurrency: string }) {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState(baseCurrency);
  const [toCurrency, setToCurrency] = useState('EUR');

  const convertedAmount = amount
    ? currencyManager.convert(parseFloat(amount), fromCurrency, toCurrency)
    : 0;

  const fromCurr = currencyManager.getCurrency(fromCurrency);
  const toCurr = currencyManager.getCurrency(toCurrency);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="from">From</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="from"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
              placeholder="Amount"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {SUPPORTED_CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.flag} {curr.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="to">To</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="to"
              type="text"
              value={convertedAmount.toFixed(toCurr?.decimals || 2)}
              readOnly
              className="flex-1 bg-muted"
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {SUPPORTED_CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.flag} {curr.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
        <p className="text-sm text-center">
          <span className="font-bold text-lg">
            {fromCurr?.symbol}{amount || '0'}
          </span>
          <span className="text-muted-foreground mx-2">=</span>
          <span className="font-bold text-lg">
            {toCurr?.symbol}{convertedAmount.toFixed(toCurr?.decimals || 2)}
          </span>
        </p>
        <p className="text-xs text-center text-muted-foreground mt-1">
          Exchange rate: 1 {fromCurrency} = {currencyManager.getExchangeRate(fromCurrency, toCurrency).toFixed(4)} {toCurrency}
        </p>
      </div>
    </div>
  );
}
