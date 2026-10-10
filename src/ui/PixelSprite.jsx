import React from 'react';
import { cellsToPaths, spriteCells } from '../game/pixel-art.js';

/**
 * Vẽ sprite pixel một màu bằng SVG (icon, chướng ngại vật trang trí).
 * size là chiều rộng hiển thị (px); mặc định tô bằng currentColor.
 */
export function PixelSprite({ rows, size = 18, color = 'currentColor', className = '', label }) {
  const cols = rows[0].length;
  const paths = cellsToPaths(spriteCells(rows, color));

  return (
    <svg
      viewBox={`0 0 ${cols} ${rows.length}`}
      width={size}
      height={(size * rows.length) / cols}
      shapeRendering="crispEdges"
      className={`shrink-0 ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {paths.map((p) => (
        <path key={p.fill} fill={p.fill} d={p.d} />
      ))}
    </svg>
  );
}
