import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const currentValue = value !== undefined ? value : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, children, ...props }, ref) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "text-foreground shadow" 
          : "hover:bg-background/50 hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-background rounded-md shadow -z-10"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  TabsContentProps
>(({ className, value, children, ...props }, ref) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.value !== value) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
});
TabsContent.displayName = "TabsContent";
