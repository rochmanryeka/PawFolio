import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { type ToastMessage, addToastListener, removeToastListener } from '@/lib/toast'

// Re-export toast for convenience so callers can import from one place
export { toast } from '@/lib/toast'
export type { ToastVariant, ToastMessage } from '@/lib/toast'

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const handler = (t: ToastMessage) => {
      setToasts(prev => [...prev, t])
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id))
      }, t.duration ?? 3000)
    }
    addToastListener(handler)
    return () => { removeToastListener(handler) }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
      ))}
    </div>
  )
}

function ToastItem({ toast: t, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />,
    error: <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
    info: <AlertCircle className="h-4 w-4 text-brown-400 shrink-0" />,
  }
  const styles = {
    success: "bg-cream dark:bg-brown-950 border-green-200 dark:border-green-800",
    error: "bg-cream dark:bg-brown-950 border-red-200 dark:border-red-800",
    info: "bg-cream dark:bg-brown-950 border-brown-200 dark:border-brown-700",
  }

  return (
    <div
      className={cn(
        "pointer-events-auto mt-3 flex items-center gap-2.5 rounded-2xl border shadow-lg px-4 py-3 text-sm font-medium max-w-sm mx-4 animate-in slide-in-from-bottom-4",
        "text-brown-950 dark:text-brown-100",
        styles[t.variant ?? 'success']
      )}
    >
      {icons[t.variant ?? 'success']}
      <span className="flex-1">{t.message}</span>
      <button onClick={onDismiss} className="ml-1 text-brown-300 dark:text-brown-500 hover:text-brown-700 dark:hover:text-brown-200">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
