import React, { useRef, useState } from 'react';
import { ICONS } from '../game/pixel-art.js';
import { soundFX } from '../utils/sound.js';
import { PixelSprite } from './PixelSprite.jsx';

/**
 * Hai thanh trượt âm lượng: nhạc nền và hiệu ứng (kéo về 0 là tắt).
 * onVolumeChange báo cho màn hình cha cập nhật biểu tượng loa.
 */
export function SoundSettings({ onVolumeChange }) {
  const [bgm, setBgm] = useState(() => Math.round(soundFX.getBgmVolume() * 100));
  const [sfx, setSfx] = useState(() => Math.round(soundFX.getSfxVolume() * 100));
  const lastPreviewRef = useRef(0);

  const rows = [
    {
      id: 'bgm',
      label: 'Nhạc nền',
      value: bgm,
      color: 'var(--color-grape)',
      icon: bgm > 0 ? ICONS.music : ICONS.musicOff,
      apply: (value) => {
        setBgm(value);
        soundFX.setBgmVolume(value / 100);
      },
    },
    {
      id: 'sfx',
      label: 'Hiệu ứng',
      value: sfx,
      color: 'var(--color-sky)',
      icon: sfx > 0 ? ICONS.sound : ICONS.soundOff,
      apply: (value) => {
        setSfx(value);
        soundFX.setSfxVolume(value / 100);
        // Phát tiếng mẫu để nghe thử mức âm lượng khi kéo
        const now = performance.now();
        if (now - lastPreviewRef.current > 150) {
          lastPreviewRef.current = now;
          soundFX.playJump();
        }
      },
    },
  ];

  return (
    <div className="grid gap-6">
      {rows.map((row) => (
        <label key={row.id} className="block">
          <span className="flex items-center justify-between text-[15px] font-semibold text-text">
            <span className="flex items-center gap-2">
              <PixelSprite rows={row.icon} size={18} color="var(--color-ink)" />
              {row.label}
            </span>
            <span className="font-pixel text-[22px] font-bold tabular-nums text-ink">
              {row.value === 0 ? 'Tắt' : `${row.value}%`}
            </span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={row.value}
            onChange={(e) => {
              row.apply(Number(e.target.value));
              onVolumeChange?.();
            }}
            className="pixel-range mt-1 w-full"
            style={{ '--pct': `${row.value}%`, '--range-color': row.color }}
          />
        </label>
      ))}
    </div>
  );
}
