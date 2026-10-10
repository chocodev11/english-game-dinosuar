import React, { useState } from 'react';
import { ICONS } from '../game/pixel-art.js';
import { ApiClient } from '../services/api-client.js';
import { GroundStage } from '../ui/GroundStage.jsx';
import { PixelBar } from '../ui/PixelBar.jsx';
import { PixelSprite } from '../ui/PixelSprite.jsx';
import { Sheet } from '../ui/Sheet.jsx';
import { soundFX } from '../utils/sound.js';
import { DinoAvatar } from './DinoAvatar.jsx';
import { SkinManager } from './skin-manager.js';
import { SKIN_TIERS, TIER_COLORS } from './skin-tiers.js';

export function SkinCollectionScreen({
  profile,
  progress,
  equippedSkin,
  onSkinEquipped,
  onProgressUpdated,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [codeOpen, setCodeOpen] = useState(false);
  const [commandCode, setCommandCode] = useState('');
  const [codeFeedback, setCodeFeedback] = useState(null);

  const skinItems = SkinManager.getAllSkinsWithStatus(profile, progress);
  const unlockedCount = skinItems.filter((i) => i.isUnlocked).length;
  const selected = skinItems.find((i) => i.skin.id === selectedId);

  const handleEquip = async (skinId) => {
    soundFX.playClick();
    const res = await ApiClient.saveEquippedSkin(profile, progress, skinId);
    if (res.success) {
      onSkinEquipped(res.equippedSkin);
      setSelectedId(null);
    }
  };

  const handleRedeemCode = (e) => {
    e.preventDefault();
    const res = SkinManager.redeemCommandCode(profile, progress, commandCode);
    if (res.success) {
      soundFX.playMilestonePass();
      onProgressUpdated(res.updatedProgress);
      onSkinEquipped(SkinManager.getEquippedSkin(profile, res.updatedProgress));
      setCommandCode('');
    } else {
      soundFX.playWrong();
    }
    setCodeFeedback({ text: res.message, isError: !res.success });
  };

  return (
    <div className="mx-auto max-w-[480px] px-4 pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <header className="flex items-baseline justify-between">
        <h1 className="font-pixel text-[46px] font-extrabold leading-none text-ink">Skin</h1>
        <p className="text-[15px] text-muted">
          <span className="font-pixel text-[26px] font-bold text-text">
            {unlockedCount}/{skinItems.length}
          </span>{' '}
          đã mở
        </p>
      </header>

      <GroundStage className="mt-3">
        <DinoAvatar skin={equippedSkin} size={112} animated />
      </GroundStage>
      <p className="mt-3 text-center text-[17px] font-semibold text-text">{equippedSkin.name}</p>
      <p
        className="text-center text-[13px] font-semibold"
        style={{ color: TIER_COLORS[equippedSkin.tier] }}
      >
        {equippedSkin.tier}
      </p>

      {SKIN_TIERS.map((tier) => {
        const items = skinItems.filter((i) => i.skin.tier === tier.id);
        if (items.length === 0) return null;
        return (
          <section key={tier.id} className="mt-8">
            <h2 className="flex items-center gap-2 font-pixel text-[26px] font-bold leading-none text-text">
              <span className="size-3" style={{ backgroundColor: tier.color }} />
              {tier.id}
            </h2>
            <ul className="mt-4 grid grid-cols-3 gap-4">
              {items.map((item) => (
                <li key={item.skin.id}>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedId(item.skin.id);
                    }}
                    className="pixel-box relative flex w-full flex-col items-center px-1.5 pt-2 pb-2.5"
                    style={
                      item.isEquipped
                        ? { '--edge': 'var(--color-sky)', '--fill': 'var(--color-sky-soft)' }
                        : undefined
                    }
                  >
                    <DinoAvatar
                      skin={item.skin}
                      size={72}
                      className={item.isUnlocked ? '' : 'opacity-45'}
                    />
                    <span className="mt-1 line-clamp-2 min-h-[2.5em] text-center text-[12px] font-semibold leading-tight text-text">
                      {item.skin.name}
                    </span>
                    {!item.isUnlocked && (
                      <PixelBar
                        value={item.progressPercent / 100}
                        color={tier.color}
                        label={`Tiến độ mở khóa ${item.skin.name}`}
                        className="mt-1.5 h-1.5"
                      />
                    )}
                    {item.isEquipped && (
                      <span className="absolute right-1 top-1 grid size-5 place-items-center bg-sky text-white">
                        <PixelSprite rows={ICONS.check} size={12} label="Đang dùng" />
                      </span>
                    )}
                    {!item.isUnlocked && (
                      <span className="absolute right-1.5 top-1.5 text-muted">
                        <PixelSprite rows={ICONS.lock} size={12} label="Đang khóa" />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-10">
        {codeOpen ? (
          <form onSubmit={handleRedeemCode}>
            <label htmlFor="skin-code" className="mb-2.5 block text-[15px] font-semibold text-text">
              Mã mở khóa
            </label>
            <div className="flex gap-4">
              <input
                id="skin-code"
                type="text"
                value={commandCode}
                autoCapitalize="characters"
                onChange={(e) => setCommandCode(e.target.value)}
                className="pixel-input flex-1 uppercase"
              />
              <button type="submit" className="pixel-btn pixel-btn-sky px-4 text-[22px]">
                Dùng mã
              </button>
            </div>
            {codeFeedback && (
              <p
                role="status"
                className={`mt-3 text-[14px] font-medium ${
                  codeFeedback.isError ? 'text-berry-deep' : 'text-leaf-deep'
                }`}
              >
                {codeFeedback.text}
              </p>
            )}
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCodeOpen(true)}
            className="min-h-11 text-[15px] font-semibold text-sky"
          >
            Có mã mở khóa?
          </button>
        )}
      </section>

      <Sheet
        open={Boolean(selected)}
        title={selected?.skin.name ?? ''}
        onClose={() => setSelectedId(null)}
      >
        {selected && (
          <>
            <GroundStage cloud={false}>
              <DinoAvatar skin={selected.skin} size={128} animated />
            </GroundStage>
            <p className="mt-4 flex items-center gap-3 text-[14px] font-semibold">
              <span style={{ color: TIER_COLORS[selected.skin.tier] }}>{selected.skin.tier}</span>
              {!selected.isUnlocked && (
                <span className="flex items-center gap-1.5 text-muted">
                  <PixelSprite rows={ICONS.lock} size={12} />
                  Chưa mở khóa
                </span>
              )}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-text">{selected.skin.description}</p>
            <div className="pixel-box mt-5 p-4">
              <p className="text-[13px] text-muted">Cách mở khóa</p>
              <p className="mt-1 text-[15px] leading-relaxed text-text">
                {selected.skin.unlockCondition.description}
              </p>
              {!selected.isUnlocked && (
                <>
                  <PixelBar
                    value={selected.progressPercent / 100}
                    color={TIER_COLORS[selected.skin.tier]}
                    label="Tiến độ mở khóa"
                    className="mt-3 h-3"
                  />
                  <p className="mt-2 text-[13px] text-muted">{selected.progressText}</p>
                </>
              )}
            </div>
            {selected.isEquipped && (
              <p className="mt-7 flex items-center justify-center gap-2 font-pixel text-[26px] font-bold text-sky">
                <PixelSprite rows={ICONS.check} size={18} />
                Đang dùng
              </p>
            )}
            {selected.isUnlocked && !selected.isEquipped && (
              <button
                type="button"
                onClick={() => handleEquip(selected.skin.id)}
                className="pixel-btn mt-7 w-full"
              >
                Dùng skin này
              </button>
            )}
          </>
        )}
      </Sheet>
    </div>
  );
}
