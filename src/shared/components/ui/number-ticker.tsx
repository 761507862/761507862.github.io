import { useEffect, useRef, useMemo } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  className?: string;
  delay?: number; // delay in seconds
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
  maxStep?: number; // New prop to control max animation range
}

export default function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
  formatter,
  maxStep,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 150,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  }, [decimalPlaces]);

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        if (maxStep !== undefined) {
          const current = motionValue.get();
          const diff = Math.abs(value - current);
          if (diff > maxStep) {
            // Jump to close proximity
            if (value > current) {
              motionValue.set(value - maxStep);
            } else {
              motionValue.set(value + maxStep);
            }
          }
        }
        motionValue.set(value);
      }, delay * 1000);
    }
  }, [motionValue, isInView, delay, value, maxStep]);

  useEffect(() => {
    const updateText = (val: number) => {
      if (!ref.current) return;
      const intVal = Math.round(val); // Strict integer constraint
      if (formatter) {
        ref.current.textContent = prefix + formatter(intVal) + suffix;
      } else {
        ref.current.textContent = prefix + numberFormatter.format(intVal) + suffix;
      }
    };

    // Set initial text content immediately
    updateText(springValue.get());

    const unsubscribe = springValue.on("change", (latest) => {
      updateText(latest);
    });

    return () => unsubscribe();
  }, [springValue, decimalPlaces, prefix, suffix, formatter]);

  return (
    <span
      className={cn("inline-block tabular-nums tracking-wider text-black dark:text-white", className)}
      ref={ref}
    />
  );
}
