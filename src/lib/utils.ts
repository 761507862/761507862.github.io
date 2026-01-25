import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatKinah(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  // Rule 1 & 2: If absolute value >= 1,000,000, format as "W" (divide by 10,000)
  if (absAmount >= 1000000) {
    // toFixed(2) keeps 2 decimals. replace(/\.00$/, '') removes trailing .00 if integer.
    const formatted = (absAmount / 10000).toFixed(2).replace(/\.00$/, '');
    return `${sign}${formatted}W`;
  }

  // Rule 2 & 4: If absolute value < 1,000,000, show raw number with separators
  return numberFormatter.format(amount);
}
