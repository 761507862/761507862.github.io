import { describe, it, expect } from 'vitest';
import { formatKinah } from './utils';

describe('formatKinah', () => {
  // 1. Positive numbers >= 1,000,000
  it('formats positive numbers >= 1,000,000 as W', () => {
    expect(formatKinah(1000000)).toBe('100W');
    expect(formatKinah(1500000)).toBe('150W');
    expect(formatKinah(3000000)).toBe('300W');
    expect(formatKinah(1550000)).toBe('155W');
    expect(formatKinah(100000000)).toBe('10000W');
  });

  // 2. Negative numbers <= -1,000,000
  it('formats negative numbers <= -1,000,000 as -XW', () => {
    expect(formatKinah(-1000000)).toBe('-100W');
    expect(formatKinah(-1500000)).toBe('-150W');
    expect(formatKinah(-3000000)).toBe('-300W');
  });

  // 3. Positive numbers < 1,000,000
  it('formats positive numbers < 1,000,000 as raw number', () => {
    expect(formatKinah(999999)).toBe('999,999');
    expect(formatKinah(500000)).toBe('500,000');
    expect(formatKinah(10000)).toBe('10,000');
    expect(formatKinah(0)).toBe('0');
  });

  // 4. Negative numbers > -1,000,000
  it('formats negative numbers > -1,000,000 as raw number', () => {
    expect(formatKinah(-999999)).toBe('-999,999');
    expect(formatKinah(-500000)).toBe('-500,000');
    expect(formatKinah(-10000)).toBe('-10,000');
  });

  // 5. Decimals handling in W mode
  it('handles decimals correctly in W mode', () => {
    expect(formatKinah(1234567)).toBe('123.46W'); // 123.4567 -> 123.46
    expect(formatKinah(-1234567)).toBe('-123.46W');
  });

  // 6. Edge cases
  it('removes trailing .00 in W mode', () => {
    expect(formatKinah(2000000)).toBe('200W'); // Not 200.00W
  });
});
