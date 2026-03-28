import { AlertTriangle } from 'lucide-react'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Konfirmasi',
  message,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <div className="flex flex-col items-center text-center gap-3 pt-2 pb-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
          variant === 'danger' ? 'bg-red-100 dark:bg-red-900/40' :
          variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/40' :
          'bg-brown-100 dark:bg-brown-800/40'
        }`}>
          <AlertTriangle className={`h-7 w-7 ${
            variant === 'danger' ? 'text-red-500' :
            variant === 'warning' ? 'text-amber-500' :
            'text-brown-400'
          }`} />
        </div>
        <DialogTitle className="mb-0">{title}</DialogTitle>
        <p className="text-sm text-brown-500 dark:text-brown-300 -mt-2">{message}</p>
        <div className="flex gap-3 w-full mt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            className="flex-1"
            onClick={() => { onConfirm(); onCancel() }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
