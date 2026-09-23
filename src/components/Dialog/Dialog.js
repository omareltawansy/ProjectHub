import React, { useEffect, useId, useRef } from 'react';

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

// Open dialogs, innermost last — only the top one reacts to Escape / Tab.
const stack = [];

/**
 * Accessible modal box. Drop-in replacement for the inner `<div className="x-modal">`
 * of an overlay: adds dialog semantics, moves focus in on open, traps Tab inside,
 * closes on Escape, and returns focus to whatever opened it.
 * The dialog is labelled by its first heading unless `aria-label` is given.
 */
export default function Dialog({ onClose, className, children, role = 'dialog', ...rest }) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const autoId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const previouslyFocused = document.activeElement;
    stack.push(node);

    if (!rest['aria-label'] && !rest['aria-labelledby']) {
      const heading = node.querySelector('h1, h2, h3, h4');
      if (heading) {
        if (!heading.id) heading.id = `dialog-title-${autoId.replace(/:/g, '')}`;
        node.setAttribute('aria-labelledby', heading.id);
      }
    }

    // Prefer the first form field; otherwise the dialog itself (so a stray Enter
    // doesn't trigger a button, e.g. a destructive confirm).
    const firstField = node.querySelector('input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])');
    (firstField || node).focus();

    const onKeyDown = (e) => {
      if (stack[stack.length - 1] !== node) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [...node.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) { e.preventDefault(); node.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const i = stack.lastIndexOf(node);
      if (i !== -1) stack.splice(i, 1);
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      role={role}
      aria-modal="true"
      tabIndex={-1}
      onClick={(e) => e.stopPropagation()}
      {...rest}
    >
      {children}
    </div>
  );
}
