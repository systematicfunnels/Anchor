import { describe, it, expect } from 'vitest';
import { calculateMargin, formatCurrency, calculateTax, calculateTotalWithTax, getCurrencySymbol, convertCurrency } from './finance';

describe('finance utilities', () => {
  describe('convertCurrency', () => {
    it('converts USD to EUR correctly', () => {
      expect(convertCurrency(100, 'USD', 'EUR')).toBeCloseTo(92, 0);
    });
    it('converts EUR to USD correctly', () => {
      expect(convertCurrency(92, 'EUR', 'USD')).toBeCloseTo(100, 0);
    });
    it('returns same amount if currencies are identical', () => {
      expect(convertCurrency(100, 'USD', 'USD')).toBe(100);
    });
  });

  describe('formatCurrency', () => {
    it('calculates correct margin percentage', () => {
      expect(calculateMargin(100, 80)).toBe(20);
      expect(calculateMargin(200, 150)).toBe(25);
    });

    it('returns 0 when price is 0', () => {
      expect(calculateMargin(0, 50)).toBe(0);
    });

    it('handles negative margins', () => {
      expect(calculateMargin(100, 120)).toBe(-20);
    });
  });

  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      // Using regex to handle non-breaking spaces and different formatting styles
      expect(formatCurrency(1000)).toMatch(/\$1,000\.00/);
    });

    it('formats EUR correctly', () => {
      expect(formatCurrency(1000, 'EUR')).toMatch(/€1,000\.00/);
    });
  });

  describe('getCurrencySymbol', () => {
    it('returns $ for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
    });

    it('returns € for EUR', () => {
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('returns £ for GBP', () => {
      expect(getCurrencySymbol('GBP')).toBe('£');
    });

    it('returns ₹ for INR', () => {
      expect(getCurrencySymbol('INR')).toBe('₹');
    });
  });

  describe('calculateTax', () => {
    it('calculates tax amount correctly', () => {
      expect(calculateTax(100, 20)).toBe(20);
      expect(calculateTax(250, 10)).toBe(25);
    });
  });

  describe('calculateTotalWithTax', () => {
    it('calculates total with tax correctly', () => {
      expect(calculateTotalWithTax(100, 20)).toBe(120);
      expect(calculateTotalWithTax(250, 10)).toBe(275);
    });
  });
});
