import React, { useEffect, useRef } from 'react';
import { ICONS } from '../game/pixel-art.js';
import { PixelSprite } from './PixelSprite.jsx';

/**
 * Bảng trượt từ đáy màn hình (mobile-first). Đóng bằng nút X, chạm nền mờ hoặc phím Esc.
 */
export function Sheet({ open, title, onClose, children, dismissible = true }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    panelRef.current?.focus();
    if (!dismissible) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/45 animate-fade"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative w-full max-w-[480px] max-h-[88dvh] overflow-y-auto bg-paper text-text shadow-[0_-3px_0_0_var(--color-ink)] animate-sheet focus:outline-none"
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="font-pixel text-[32px] font-bold leading-none text-ink">
            {title}
          </h2>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="-mr-2 grid size-11 place-items-center text-ink"
            >
              <PixelSprite rows={ICONS.close} size={20} />
            </button>
          )}
        </div>
        <div className="px-5 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
