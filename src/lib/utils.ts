import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKinah(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  // Rule 1 & 2: If absolute value >= 1,000,000, format as "W" (divide by 10,000)
  if (absAmount >= 1000000) {
    // toFixed(2) keeps 2 decimals. replace(/\.00$/, '') removes trailing .00 if integer.
    // Note: If it's like 123.40, toFixed(2) -> "123.40". We might want "123.4". 
    // But requirement says "retaining up to two decimal places" and "avoid extra spaces".
    // Usually standard `toFixed(2)` is fine, or `parseFloat(num.toFixed(2))` to remove trailing zeros.
    // The previous implementation used `replace(/\.00$/, '')`. I'll stick to that or improve it.
    const formatted = (absAmount / 10000).toFixed(2).replace(/\.00$/, '');
    return `${sign}${formatted}W`;
  }

  // Rule 2 & 4: If absolute value < 1,000,000, show raw number with separators
  return amount.toLocaleString();
}
