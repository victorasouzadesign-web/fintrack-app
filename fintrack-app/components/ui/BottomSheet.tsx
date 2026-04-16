'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>

              <Dialog.Content asChild>
                <motion.div
                  className={cn(
                    'fixed bottom-0 left-0 right-0 z-50 flex justify-center',
                  )}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                >
                  <div
                    className={cn(
                      'w-full max-w-md bg-[#111827] rounded-t-2xl border border-[#1E293B] border-b-0',
                      'shadow-[0_-4px_40px_rgba(0,0,0,0.5)]',
                      className
                    )}
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                  >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1">
                      <div className="w-10 h-1 bg-[#1E293B] rounded-full" />
                    </div>

                    {/* Header */}
                    {title && (
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E293B]">
                        <Dialog.Title className="text-base font-semibold text-[#F8FAFC]">
                          {title}
                        </Dialog.Title>
                        <button
                          onClick={onClose}
                          className="text-[#475569] hover:text-[#94A3B8] transition-colors p-1 rounded-lg hover:bg-[#1C2537]"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}

                    {children}
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
