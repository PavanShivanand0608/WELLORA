import { useEffect, useRef } from 'react'
import { Button } from '../ui'

interface ConfirmDeleteDialogProps {
  mealName: string
  onCancel: () => void
  onConfirm: () => Promise<void> | void
  isDeleting?: boolean
  error?: string
}

export function ConfirmDeleteDialog({ mealName, onCancel, onConfirm, isDeleting = false, error }: ConfirmDeleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby="delete-meal-title"
      aria-describedby="delete-meal-description"
      className="m-auto w-[min(100%-2rem,28rem)] rounded-card border-0 bg-screen p-0 text-ink shadow-phone backdrop:bg-panel/60"
      onCancel={(event) => { event.preventDefault(); onCancel() }}
    >
      <div className="p-6">
        <h2 id="delete-meal-title" className="text-lg font-semibold">Delete this meal?</h2>
        <p id="delete-meal-description" className="mt-2 text-sm leading-6 text-muted">
          “{mealName}” will be removed from your Meal Log. This action cannot be undone.
        </p>
        {error ? <p role="alert" className="mt-3 rounded-tile border border-accent bg-accent-soft/60 p-3 text-sm text-ink">{error}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="light" disabled={isDeleting} onClick={onCancel}>Keep meal</Button>
          <Button variant="dark" loading={isDeleting} onClick={() => { if (!isDeleting) void onConfirm() }}>Delete meal</Button>
        </div>
      </div>
    </dialog>
  )
}
