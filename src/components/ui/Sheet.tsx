import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Right-hand side panel used for contextual create/edit flows on the web app.
 * Exported as both Drawer and BottomSheet so existing call sites keep working.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md'








}: {open: boolean;onClose: () => void;title: string;description?: string;children: React.ReactNode;footer?: React.ReactNode;width?: 'md' | 'lg';}) {
  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[70] flex justify-end">
          <motion.button
          aria-label="Close"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          onClick={onClose}
          className="absolute inset-0 bg-ink-900/45" />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.26, ease: EASE }}
          className={`relative flex h-full w-full flex-col bg-white shadow-sheet ${
          width === 'lg' ? 'sm:w-[640px]' : 'sm:w-[480px]'}`
          }>
          
            <div className="flex items-start gap-3 border-b border-ink-100 px-6 pb-4 pt-5">
              <div className="min-w-0 flex-1">
                <h2 className="display-tight text-[17px] font-bold text-ink-900">{title}</h2>
                {description && <p className="mt-0.5 text-[12.5px] text-ink-400">{description}</p>}
              </div>
              <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 -mt-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-colors duration-150 ease-smooth hover:bg-ink-100">
              
                <XIcon className="h-[18px] w-[18px]" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="border-t border-ink-100 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}

export const BottomSheet = Drawer;

export function Modal({
  open,
  onClose,
  title,
  children,
  footer






}: {open: boolean;onClose: () => void;title: string;children: React.ReactNode;footer?: React.ReactNode;}) {
  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
          <motion.button
          aria-label="Close"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE }}
          onClick={onClose}
          className="absolute inset-0 bg-ink-900/50" />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="relative flex max-h-[calc(100vh-40px)] w-full max-w-[480px] flex-col rounded-2xl bg-white p-6 shadow-raised">
          
            <h2 className="display-tight shrink-0 text-[17px] font-bold text-ink-900">{title}</h2>
            {/* Long confirmations scroll inside the dialog rather than off-screen. */}
            <div className="-mx-1 mt-3 min-h-0 flex-1 overflow-y-auto px-1">{children}</div>
            {footer && <div className="mt-6 flex shrink-0 gap-2.5">{footer}</div>}
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}