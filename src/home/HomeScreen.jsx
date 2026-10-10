import React, { useState } from 'react';
import { GAME_MODES, MILESTONE_CONFIGS } from '../../data/config/game-config';
import { MilestoneManager } from '../game/milestone-manager';
import { ICONS } from '../game/pixel-art';
import { DinoAvatar } from '../skins/DinoAvatar';
import { GroundStage } from '../ui/GroundStage';
import { PixelBar } from '../ui/PixelBar';
import { PixelSprite } from '../ui/PixelSprite';
import { Sheet } from '../ui/Sheet';
import { SoundSettings } from '../ui/SoundSettings';
import { padScore } from '../utils/format';
import { soundFX } from '../utils/sound';

// Màu & số vạch độ khó của từng chế độ
const MODE_STYLES = {
  BASIC: { color: 'var(--color-leaf)', level: 1 },
  MEDIUM: { color: 'var(--color-tangerine)', level: 2 },
  HARDCORE: { color: 'var(--color-berry)', level: 3 },
};

const RULES = [
  'Chạm màn hình hoặc nhấn Space để nhảy qua chướng ngại vật. Đâm vào là thua.',
  'Mỗi lần nhảy có một câu hỏi. Đúng được +1 điểm, sai hoặc hết giờ thì không có điểm nhưng vẫn chạy tiếp.',
  'Đủ số câu đúng sẽ mở thử thách cột mốc. Vượt mốc để mở skin và chứng chỉ.',
];

export function HomeScreen({
  profile,
  progress,
  equippedSkin,
  selectedMode,
  onSelectMode,
  onPlay,
  onOpenSkins,
  onLogout,
}) {
  const [openSheet, setOpenSheet] = useState(null);
  const isMuted = () => !soundFX.isEnabled() && !soundFX.isBgmEnabled();
  const [muted, setMuted] = useState(isMuted);
  const closeSheet = () => setOpenSheet(null);
  const milestone = MilestoneManager.getNextMilestoneProgress(progress.highScore);

  return (
    <div className="mx-auto max-w-[480px] px-4 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpenSheet('profile')}
          className="flex min-h-11 items-center gap-3 text-left"
        >
          <span className="grid size-10 place-items-center bg-ink text-paper">
            <PixelSprite rows={ICONS.user} size={18} />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold text-text">{profile.fullName}</span>
            <span className="block text-[13px] text-muted">Lớp {profile.className}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOpenSheet('sound')}
          aria-label="Âm thanh"
          className="grid size-11 place-items-center text-ink"
        >
          <PixelSprite rows={muted ? ICONS.soundOff : ICONS.sound} size={22} />
        </button>
      </header>

      <h1 className="mt-7 text-center font-pixel text-[58px] font-extrabold leading-[0.95] text-ink short:mt-3 short:text-[46px]">
        English Game
        <br />
        Dinosaur
      </h1>
      <p className="mt-3 text-center text-[15px] text-muted short:mt-1.5">Ôn Tiếng Anh 10 Global Success</p>

      <div className="relative mt-5 short:mt-2">
        <p className="absolute right-1 top-0 font-pixel text-[22px] font-bold tabular-nums text-muted">
          HI {padScore(progress.highScore)}
        </p>
        <GroundStage cactus className="pt-8 short:pt-5">
          <button
            type="button"
            onClick={onOpenSkins}
            aria-label={`Skin đang dùng: ${equippedSkin.name}. Mở bộ sưu tập`}
          >
            <DinoAvatar skin={equippedSkin} size={104} animated className="short:size-[84px]" />
          </button>
        </GroundStage>
      </div>

      <div role="radiogroup" aria-label="Chế độ chơi" className="mt-6 grid grid-cols-3 gap-4 short:mt-4">
        {Object.values(GAME_MODES).map((mode) => {
          const selected = mode.id === selectedMode;
          const style = MODE_STYLES[mode.id];
          return (
            <button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelectMode(mode.id)}
              className="pixel-box flex flex-col items-center gap-1.5 py-3 short:py-2"
              style={selected ? { '--fill': style.color } : undefined}
            >
              <span
                className={`font-pixel text-[25px] font-bold leading-none ${
                  selected ? 'text-[#1f1f1f]' : 'text-text'
                }`}
              >
                {mode.name}
              </span>
              <span className={`text-[13px] ${selected ? 'text-[#1f1f1f]' : 'text-muted'}`}>
                {mode.questionTimeLimitSec} giây/câu
              </span>
              <span className="flex gap-1" aria-hidden="true">
                {[1, 2, 3].map((i) => {
                  let pip = 'var(--color-rule)';
                  if (i <= style.level) pip = selected ? '#1f1f1f' : style.color;
                  return <span key={i} className="size-1.5" style={{ backgroundColor: pip }} />;
                })}
              </span>
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onPlay} className="pixel-btn mt-7 min-h-16 w-full text-[36px] short:mt-5 short:min-h-14">
        <PixelSprite rows={ICONS.play} size={22} />
        Chơi
      </button>

      <div className="mt-7 short:mt-5">
        <div className="flex items-baseline justify-between text-[14px]">
          <span className="text-muted">Mốc tiếp theo: {milestone.nextThreshold} câu đúng</span>
          <span className="font-semibold text-sun-deep">còn {milestone.pointsRemaining} câu</span>
        </div>
        <PixelBar
          value={milestone.progressPercent / 100}
          color="var(--color-sun)"
          label="Kỷ lục so với cột mốc tiếp theo"
          className="mt-2 h-3"
        />
      </div>

      <button
        type="button"
        onClick={() => setOpenSheet('help')}
        className="mx-auto mt-4 flex min-h-11 items-center gap-2 text-[15px] font-semibold text-sky"
      >
        <PixelSprite rows={ICONS.help} size={14} />
        Cách chơi
      </button>

      <Sheet open={openSheet === 'help'} title="Cách chơi" onClose={closeSheet}>
        <ol className="grid gap-4">
          {RULES.map((rule, idx) => (
            <li key={rule} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center bg-sun font-pixel text-[22px] font-bold text-[#1f1f1f]">
                {idx + 1}
              </span>
              <p className="pt-1 text-[16px] leading-relaxed text-text">{rule}</p>
            </li>
          ))}
        </ol>
        <table className="mt-6 w-full text-left text-[15px]">
          <thead>
            <tr className="text-[13px] text-muted">
              <th className="pb-2 font-medium">Mốc (câu đúng)</th>
              <th className="pb-2 text-right font-medium">Thử thách</th>
            </tr>
          </thead>
          <tbody>
            {MILESTONE_CONFIGS.map((m) => (
              <tr key={m.id} className="border-t border-rule">
                <td className="py-2 font-pixel text-[22px] font-bold text-ink">
                  {m.scoreThreshold}
                  {m.isRecurringFromThreshold ? '+' : ''}
                </td>
                <td className="py-2 text-right">
                  Đúng {m.minCorrectOverride ?? Math.ceil(m.questionCount * m.passRatio)}/{m.questionCount} câu
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>

      <Sheet open={openSheet === 'sound'} title="Âm thanh" onClose={closeSheet}>
        <SoundSettings onVolumeChange={() => setMuted(isMuted())} />
      </Sheet>

      <Sheet open={openSheet === 'profile'} title="Người chơi" onClose={closeSheet}>
        <div className="flex items-center gap-4">
          <DinoAvatar skin={equippedSkin} size={64} />
          <div>
            <p className="text-[18px] font-semibold text-text">{profile.fullName}</p>
            <p className="text-[15px] text-muted">Lớp {profile.className}</p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-4 text-center">
          {[
            ['Kỷ lục', progress.highScore],
            ['Lượt chơi', progress.gamesPlayed],
            ['Câu đúng', progress.totalCorrectAnswers],
          ].map(([label, value]) => (
            <div key={label} className="pixel-box py-3">
              <dt className="text-[13px] text-muted">{label}</dt>
              <dd className="font-pixel text-[30px] font-bold leading-none text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <button type="button" onClick={onLogout} className="pixel-btn pixel-btn-quiet mt-8 w-full">
          Đổi người chơi
        </button>
        <p className="mt-3 text-center text-[13px] text-muted">
          Điểm của bạn vẫn được lưu trên máy này.
        </p>
      </Sheet>
    </div>
  );
}
