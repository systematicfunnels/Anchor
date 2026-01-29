/**
 * Core Financial Logic for Anchor (Solo)
 */

export const calculateMargin = (price: number, cost: number): number => {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
};

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
};

export const convertCurrency = (amount: number, from: string, to: string): number => {
  if (from === to) return amount;
  const baseAmount = amount / (EXCHANGE_RATES[from] || 1);
  return baseAmount * (EXCHANGE_RATES[to] || 1);
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const getCurrencySymbol = (currency: string = 'USD'): string => {
  return (0).toLocaleString('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace(/\d/g, '').trim();
};

export const calculateTax = (amount: number, taxRate: number): number => {
  return amount * (taxRate / 100);
};

export const calculateTotalWithTax = (amount: number, taxRate: number): number => {
  return amount + calculateTax(amount, taxRate);
};

export const getMarginStatus = (margin: number) => {
  if (margin < 10) return 'critical';
  if (margin < 20) return 'warning';
  return 'healthy';
};

export const getMarginColor = (margin: number) => {
  const status = getMarginStatus(margin);
  if (status === 'critical') return 'text-red-600';
  if (status === 'warning') return 'text-amber-600';
  return 'text-green-600';
};
