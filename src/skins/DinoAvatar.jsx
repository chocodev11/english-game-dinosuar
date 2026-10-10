import React, { useMemo } from 'react';
import { DINO_FRAME, cellsToPaths, getDinoCells } from '../game/pixel-art.js';

/**
 * Khủng long pixel theo Skin. Dùng chung khung với sprite trong Canvas.
 * pose: 'stand' | 'crash'; animated: chớp mắt khi đứng yên.
 */
export function DinoAvatar({ skin, size = 96, pose = 'stand', animated = false, className = '' }) {
  const { x, y, w, h } = DINO_FRAME;

  const basePaths = useMemo(() => cellsToPaths(getDinoCells(skin.visual, pose)), [skin, pose]);

  // Chỉ vẽ lại các ô khác biệt của khung "chớp mắt" để chồng lên khung gốc
  const blinkPaths = useMemo(() => {
    if (!animated || pose !== 'stand') return [];
    const base = new Map(
      getDinoCells(skin.visual, 'stand').map((c) => [`${c.x},${c.y}`, c.color])
    );
    const diff = getDinoCells(skin.visual, 'blink').filter(
      (c) => base.get(`${c.x},${c.y}`) !== c.color
    );
    return cellsToPaths(diff);
  }, [skin, animated, pose]);

  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label={skin.name}
    >
      {basePaths.map((p) => (
        <path key={p.fill} fill={p.fill} d={p.d} />
      ))}
      {blinkPaths.length > 0 && (
        <g className="animate-dino-blink" style={{ opacity: 0 }}>
          {blinkPaths.map((p) => (
            <path key={p.fill} fill={p.fill} d={p.d} />
          ))}
        </g>
      )}
    </svg>
  );
}
