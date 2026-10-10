import React from 'react';
import { CLOUD_SPRITE, OBSTACLE_SPRITES } from '../game/pixel-art.js';
import { PixelSprite } from './PixelSprite.jsx';

const SPECKS = [
  [4, 3, 6],
  [22, 8, 3],
  [41, 4, 3],
  [58, 9, 6],
  [77, 3, 3],
  [88, 7, 3],
];

/** Dải mặt đất pixel trang trí; phần tử con đứng ngay trên vạch đất. */
export function GroundStage({ children, className = '', cloud = true, cactus = false }) {
  return (
    <div className={`relative ${className}`}>
      {cloud && (
        <PixelSprite
          rows={CLOUD_SPRITE}
          size={64}
          color="var(--color-rule)"
          className="absolute left-[8%] top-1"
        />
      )}
      <div className="relative flex items-end justify-center gap-12 px-6">
        {children}
        {cactus && (
          <PixelSprite
            rows={OBSTACLE_SPRITES.CACTUS_SMALL}
            size={30}
            color="var(--color-ink)"
          />
        )}
      </div>
      <div className="h-[3px] bg-ink" />
      <svg className="block h-3 w-full" aria-hidden="true">
        <defs>
          <pattern id="ground-specks" width="96" height="12" patternUnits="userSpaceOnUse">
            {SPECKS.map(([x, y, w]) => (
              <rect key={x} x={x} y={y} width={w} height="2" fill="var(--color-ink)" />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ground-specks)" />
      </svg>
    </div>
  );
}
