import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, footer, className }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-brown-950/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div
        className={cn(
          "relative z-50 w-full max-w-lg max-h-[90dvh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-cream dark:bg-brown-950 border border-brown-200 dark:border-brown-800 shadow-xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-xl p-2 active:bg-brown-100 dark:active:bg-brown-800/50 transition-colors"
        >
          <X className="h-4 w-4 text-brown-400" />
        </button>
        <div className="overflow-y-auto flex-1 p-6 pb-4">
          {children}
        </div>
        {footer ? (
          <div
            className="px-6 pt-3 pb-6 border-t border-brown-100 dark:border-brown-800/60 shrink-0"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
          >
            {footer}
          </div>
        ) : (
          <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
        )}
      </div>
    </div>
  )
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-semibold text-brown-950 dark:text-brown-100 mb-4", className)}>{children}</h2>
}
