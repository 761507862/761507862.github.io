import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface GeneratedIconProps {
  id: string;
  className?: string;
}

export function GeneratedIcon({ id, className }: GeneratedIconProps) {
  const style = useMemo(() => {
    // Simple hash function to generate deterministic values
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Low saturation colors (20-60%) to avoid high intensity
    // Avoid Red hues (approx 340-20 or 0-20, and 340-360)
    // Let's restrict Hue to 30-330
    let hue1 = Math.abs(hash % 300) + 30; 
    let hue2 = Math.abs((hash >> 8) % 300) + 30;

    const sat = 20 + (Math.abs(hash) % 40); // 20-60% saturation
    const light = 40 + (Math.abs(hash >> 4) % 30); // 40-70% lightness

    const color1 = `hsl(${hue1}, ${sat}%, ${light}%)`;
    const color2 = `hsl(${hue2}, ${sat}%, ${light}%)`;

    // Generate pattern type (0: gradient, 1: circle, 2: stripe)
    const patternType = Math.abs(hash % 3);
    const angle = Math.abs(hash % 360);

    let background = '';
    if (patternType === 0) {
      background = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    } else if (patternType === 1) {
      background = `radial-gradient(circle at ${Math.abs(hash % 100)}% ${Math.abs((hash >> 4) % 100)}%, ${color1}, ${color2})`;
    } else {
      background = `repeating-linear-gradient(${angle}deg, ${color1}, ${color1} 10px, ${color2} 10px, ${color2} 20px)`;
    }

    return { background };
  }, [id]);

  return (
    <div 
      className={cn("w-full h-full rounded-lg shadow-inner", className)} 
      style={style}
    />
  );
}
