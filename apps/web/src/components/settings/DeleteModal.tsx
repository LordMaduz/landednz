import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface DeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteModal({ open, onClose, onConfirm }: DeleteModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card rounded-card shadow-modal w-full max-w-[420px] p-6 fade-in scale-in">
        <div className="w-12 h-12 bg-error-light flex items-center justify-center rounded-full mx-auto mb-4">
          <AlertTriangle className="text-error w-6 h-6" />
        </div>
        <h3 className="font-display text-h3 text-text-primary text-center mb-2">
          Delete your account?
        </h3>
        <p className="text-small text-text-secondary text-center mb-6">
          This will permanently delete your account and roadmap. This action cannot be undone.
        </p>
        <div className="flex gap-4 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-error text-white hover:bg-error/90"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}