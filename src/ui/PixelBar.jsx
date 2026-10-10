import React from 'react';

/**
 * Thanh tiến độ dạng khối pixel (value từ 0 đến 1).
 * fillRef cho phép cập nhật trực tiếp phần tô màu mỗi khung hình mà không render lại React.
 */
export function PixelBar({ value, color = 'var(--color-sky)', label, className = 'h-3', fillRef }) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`relative w-full bg-rule [mask-image:repeating-linear-gradient(90deg,#000_0_9px,transparent_9px_12px)] ${className}`}
    >
      <div ref={fillRef} className="h-full" style={{ width: `${percent}%`, backgroundColor: color }} />
    </div>
  );
}
