import React from 'react';
import { DinoAvatar } from '../skins/DinoAvatar';
import { TIER_COLORS } from '../skins/skin-tiers';
import { GroundStage } from '../ui/GroundStage';
import { PixelSprite } from '../ui/PixelSprite';
import { padScore } from '../utils/format';
import { ICONS } from './pixel-art';

export function ResultScreen({ summary, equippedSkin, onReplay, onHome, onEquipSkin }) {
  const { run, submission } = summary;
  const milestonesPassed = run.milestonesPassedInRun.length;

  return (
    <div className="mx-auto max-w-[480px] px-4 pt-[calc(1.75rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center">
      <h1 className="font-pixel text-[46px] font-extrabold leading-none tracking-[0.3em] text-ink">
        GAME OVER
      </h1>

      <GroundStage cactus cloud={false} className="mt-6">
        <DinoAvatar skin={equippedSkin} pose="crash" size={92} />
      </GroundStage>

      <p className="mt-6 text-[15px] text-muted">Số câu đúng lượt này</p>
      <p className="font-pixel text-[78px] font-extrabold leading-none tabular-nums text-ink">
        {padScore(run.finalScore)}
      </p>
      {submission.isNewHighScore ? (
        <p
          className="pixel-box mt-3 inline-block px-3 py-1 font-pixel text-[24px] font-bold text-[#1f1f1f] animate-pop"
          style={{ '--fill': 'var(--color-sun)' }}
        >
          Kỷ lục mới!
        </p>
      ) : (
        <p className="mt-2 font-pixel text-[24px] font-bold tabular-nums text-muted">
          HI {padScore(submission.updatedProgress.highScore)}
        </p>
      )}

      <dl className="mt-7 grid grid-cols-2 gap-4">
        <div className="pixel-box py-3">
          <dt className="text-[13px] text-muted">Chính xác</dt>
          <dd className="font-pixel text-[36px] font-bold leading-none text-leaf-deep">
            {run.totalQuestions > 0
              ? `${Math.round((run.correctAnswers / run.totalQuestions) * 100)}%`
              : '--'}
          </dd>
        </div>
        <div className="pixel-box py-3">
          <dt className="text-[13px] text-muted">Xếp hạng</dt>
          <dd className="font-pixel text-[36px] font-bold leading-none text-sky">
            {submission.playerRank ? `#${submission.playerRank}` : '--'}
          </dd>
        </div>
      </dl>

      {(submission.enteredTop3 || milestonesPassed > 0) && (
        <ul className="mt-5 grid gap-1 text-[15px] font-semibold">
          {submission.enteredTop3 && (
            <li className="text-sky">Bạn vừa vào Top 3 bảng xếp hạng!</li>
          )}
          {milestonesPassed > 0 && (
            <li className="text-sun-deep">Vượt {milestonesPassed} cột mốc trong lượt này.</li>
          )}
        </ul>
      )}

      {submission.newlyUnlockedSkins.length > 0 && (
        <section className="mt-8 text-left">
          <h2 className="font-pixel text-[28px] font-bold text-text">Skin mới mở khóa</h2>
          <ul className="mt-3 grid gap-4">
            {submission.newlyUnlockedSkins.map((skin) => {
              const inUse = skin.id === equippedSkin.id;
              return (
                <li key={skin.id} className="pixel-box flex items-center gap-3 p-3">
                  <DinoAvatar skin={skin} size={56} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-semibold text-text">{skin.name}</p>
                    <p className="text-[13px] font-semibold" style={{ color: TIER_COLORS[skin.tier] }}>
                      {skin.tier}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={inUse}
                    onClick={() => onEquipSkin(skin.id)}
                    className="pixel-btn pixel-btn-leaf min-h-11 px-4 text-[20px]"
                  >
                    {inUse ? 'Đang dùng' : 'Dùng'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-9 grid gap-5">
        <button type="button" onClick={onReplay} className="pixel-btn min-h-16 w-full text-[34px]">
          <PixelSprite rows={ICONS.restart} size={22} />
          Chơi lại
        </button>
        <button type="button" onClick={onHome} className="pixel-btn pixel-btn-quiet w-full">
          Trang chính
        </button>
      </div>
    </div>
  );
}
