import { useStore } from '../store/useStore';
import { formatCurrency as formatUtility, getCurrencySymbol, convertCurrency } from '../lib/finance';
import { Currency } from '../types';

export const useCurrency = () => {
  const { settings, updateSettings, viewCurrency, setViewCurrency } = useStore();
  const globalCurrency = (settings.currency as Currency) || 'USD';
  
  // The currency currently being used for display
  const effectiveCurrency = viewCurrency || globalCurrency;

  const format = (amount: number, fromCurrency?: string) => {
    // If the amount has a specific currency (like from a client), use that as the source.
    // Otherwise, assume it's in the global default currency.
    const sourceCurrency = fromCurrency || globalCurrency;
    
    // If we have a view currency set (for exchange check), convert from source to view currency.
    if (viewCurrency && viewCurrency !== sourceCurrency) {
      const convertedAmount = convertCurrency(amount, sourceCurrency as Currency, viewCurrency);
      return formatUtility(convertedAmount, viewCurrency);
    }
    
    // Otherwise, just format it in its original/default currency.
    return formatUtility(amount, sourceCurrency as Currency);
  };

  const getSymbol = (currency?: string) => {
    return getCurrencySymbol(currency || effectiveCurrency);
  };

  const setGlobalCurrency = async (currency: Currency) => {
    await updateSettings('currency', currency);
  };

  return {
    formatCurrency: format,
    getCurrencySymbol: getSymbol,
    globalCurrency,
    effectiveCurrency,
    viewCurrency,
    setViewCurrency,
    setGlobalCurrency,
    isViewMode: !!viewCurrency && viewCurrency !== globalCurrency,
    currencies: ['USD', 'EUR', 'GBP', 'INR'] as Currency[]
  };
};
