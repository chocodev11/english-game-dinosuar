import React from 'react';
import { ICONS } from '../game/pixel-art.js';
import { PixelSprite } from './PixelSprite.jsx';

const TABS = [
  { screen: 'MAIN_MENU', label: 'Chơi', icon: ICONS.play, bg: 'var(--color-sun)', fg: '#2b2b2b' },
  { screen: 'SKIN_COLLECTION', label: 'Skin', icon: ICONS.dino, bg: 'var(--color-bubblegum)', fg: '#2b2b2b' },
  { screen: 'LEADERBOARD', label: 'Xếp hạng', icon: ICONS.trophy, bg: 'var(--color-sky)', fg: '#ffffff' },
  { screen: 'CERTIFICATE', label: 'Chứng chỉ', icon: ICONS.medal, bg: 'var(--color-grape)', fg: '#ffffff' },
];

export function TabBar({ current, onNavigate }) {
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-40 bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-3px_0_0_var(--color-ink)]"
    >
      <ul className="mx-auto grid max-w-[480px] grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.screen === current;
          return (
            <li key={tab.screen}>
              <button
                type="button"
                onClick={() => onNavigate(tab.screen)}
                aria-current={active ? 'page' : undefined}
                className="flex h-16 w-full flex-col items-center justify-center gap-1"
              >
                <span
                  className="grid h-7 w-11 place-items-center"
                  style={active ? { backgroundColor: tab.bg, color: tab.fg } : { color: 'var(--color-muted)' }}
                >
                  <PixelSprite rows={tab.icon} size={18} />
                </span>
                <span
                  className={`font-pixel text-[18px] leading-none ${
                    active ? 'font-bold text-text' : 'font-medium text-muted'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
