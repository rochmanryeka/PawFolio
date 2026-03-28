/** Toast event bus singleton — import from here in non-component code */

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  variant?: ToastVariant
  duration?: number
}

type ToastListener = (toast: ToastMessage) => void
export const toastListeners = new Set<ToastListener>()

export function addToastListener(fn: ToastListener) { toastListeners.add(fn) }
export function removeToastListener(fn: ToastListener) { toastListeners.delete(fn) }

export const toast = {
  show(message: string, variant: ToastVariant = 'success', duration = 3000) {
    const t: ToastMessage = { id: crypto.randomUUID(), message, variant, duration }
    toastListeners.forEach(l => l(t))
  },
  success: (msg: string) => toast.show(msg, 'success'),
  error:   (msg: string) => toast.show(msg, 'error'),
  info:    (msg: string) => toast.show(msg, 'info'),
}
