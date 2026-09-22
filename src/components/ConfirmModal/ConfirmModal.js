import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cm-backdrop" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cm-header">
          <div className={`cm-icon cm-icon-${variant}`}>
            <AlertTriangle size={18} />
          </div>
          <h3 className="cm-title">{title}</h3>
          <button type="button" className="cm-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {message && <p className="cm-message">{message}</p>}
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
      </div>
    </div>
  );
}
