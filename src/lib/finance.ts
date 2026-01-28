/**
 * Core Financial Logic for ServiceOps Manager
 */

export const calculateMargin = (price: number, cost: number): number => {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
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
