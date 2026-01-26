import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './button';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components for better composition (Shadcn UI style) ---

export const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 pb-4 ${className || ''}`}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}>{children}</h3>
);

export const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className || ''}`}>{children}</p>
);

export const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>{children}</div>
);

export const DialogFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center justify-end gap-2 p-6 pt-0 ${className || ''}`}>{children}</div>
);

// --- Main Dialog Component ---

interface DialogProps {
  open?: boolean; // Shadcn uses 'open'
  isOpen?: boolean; // Legacy prop support
  onOpenChange?: (open: boolean) => void; // Shadcn uses 'onOpenChange'
  onClose?: () => void; // Legacy prop support
  title?: string; // Legacy prop support
  children: React.ReactNode;
  footer?: React.ReactNode; // Legacy prop support
}

export const Dialog: React.FC<DialogProps> = ({ 
  open, 
  isOpen, 
  onOpenChange, 
  onClose, 
  title, 
  children, 
  footer 
}) => {
  // Normalize props to handle both styles
  const isVisible = open ?? isOpen ?? false;
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isVisible) {
      // Store original overflow to restore later if needed, though usually '' is fine
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      // Use empty string to remove the inline style completely
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible]);

  if (typeof document === 'undefined') return null;

  // Check if children already use the new composition pattern
  // This is a naive check but helps with backward compatibility
  const hasComposition = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && (
      child.type === DialogHeader || 
      child.type === DialogContent || 
      child.type === DialogFooter
    )
  );

  const maxWidthClass = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.props.className?.includes('max-w-')
  ) ? "" : "max-w-lg";

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10, pointerEvents: 'none' }}
            transition={{ duration: 0.2 }}
            className={`relative ${maxWidthClass ? 'w-full' : ''} ${maxWidthClass} overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg sm:rounded-xl pointer-events-auto`}
          >
            {hasComposition ? (
               // New Composition Mode: Render children directly, they contain Header/Content/Footer
               children
            ) : (
               // Legacy Mode: Use props to construct layout
               <>
                 <div className="flex flex-col space-y-1.5 p-6 pb-4">
                   <div className="flex items-center justify-between">
                     {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
                     <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleClose}>
                       <X className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
                 <div className="p-6 pt-0">{children}</div>
                 {footer && <div className="flex items-center justify-end gap-2 p-6 pt-0">{footer}</div>}
               </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
