import React from 'react';
import Dialog from '../Dialog/Dialog';
import { X, AlertTriangle } from 'lucide-react';
import './ConfirmModal.css';

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  // Dialog handles Escape, focus trapping and focus restore. Initial focus lands on
  // the dialog itself, so a stray Enter can't trigger the (possibly destructive) confirm.
  return (
    <div className="cm-backdrop" onClick={onClose}>
      <Dialog
        className="cm-modal"
        role="alertdialog"
        onClose={onClose}
        aria-describedby={message ? 'cm-message' : undefined}
      >
        <div className="cm-header">
          <div className={`cm-icon cm-icon-${variant}`}>
            <AlertTriangle size={18} />
          </div>
          <h3 className="cm-title">{title}</h3>
          <button type="button" className="cm-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {message && <p className="cm-message" id="cm-message">{message}</p>}
        <div className="cm-actions">
          <button type="button" className="cm-btn cm-btn-cancel" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`cm-btn cm-btn-confirm cm-btn-${variant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
