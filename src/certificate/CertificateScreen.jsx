import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ICONS } from '../game/pixel-art.js';
import { DinoAvatar } from '../skins/DinoAvatar.jsx';
import { PixelSprite } from '../ui/PixelSprite.jsx';
import { Sheet } from '../ui/Sheet.jsx';
import { soundFX } from '../utils/sound.js';
import { CertificateManager } from './certificate-manager.js';

const BADGE_COLORS = {
  BRONZE: '#e0965a',
  SILVER: '#c9cdd3',
  GOLD: '#ffcc1a',
  HONOR: '#a78bfa',
};

// Các điều kiện cần đạt của một chứng chỉ, kèm tiến độ hiện tại
function getRequirementChecks(req, progress) {
  return [
    { label: 'Kỷ lục', current: progress.highScore, target: req.minHighScore },
    { label: 'Câu đúng', current: progress.totalCorrectAnswers, target: req.minTotalCorrect },
    { label: 'Cột mốc', current: progress.milestonesPassedCount, target: req.minMilestoneCleared },
  ].filter((c) => c.target > 0);
}

function CertificateDocument({ cert, skin }) {
  const { requirement: req, record } = cert;

  return (
    <div className="bg-white px-5 pt-0 pb-6 text-center text-[#2b2b2b] [print-color-adjust:exact] shadow-[0_0_0_3px_#535353]">
      <div className="mx-auto h-3 w-full" style={{ backgroundColor: BADGE_COLORS[req.badgeLevel] }} />
      <p className="mt-5 font-pixel text-[20px] font-bold tracking-[0.2em] text-[#6f6f6f]">
        English Game Dinosaur
      </p>
      <div className="mt-3 flex justify-center">
        <DinoAvatar skin={skin} size={72} />
      </div>
      <h3 className="mt-3 font-pixel text-[32px] font-extrabold leading-tight">{req.title}</h3>
      <p className="mt-1 text-[13px] text-[#6f6f6f]">{req.englishTitle}</p>
      <p className="mt-5 text-[14px] text-[#6f6f6f]">Trao cho</p>
      <p className="font-pixel text-[40px] font-extrabold leading-tight">{record.fullName}</p>
      <p className="text-[15px]">Lớp {record.className}</p>
      <p className="mx-auto mt-4 max-w-[36ch] text-[14px] leading-relaxed">{req.description}</p>
      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-[#e2e2e2] pt-4 text-[12px]">
        <div>
          <dt className="text-[#6f6f6f]">Kỷ lục</dt>
          <dd className="font-pixel text-[22px] font-bold">{record.achievedScore}</dd>
        </div>
        <div>
          <dt className="text-[#6f6f6f]">Ngày cấp</dt>
          <dd className="mt-1 font-semibold">
            {new Date(record.issuedAt).toLocaleDateString('vi-VN')}
          </dd>
        </div>
        <div>
          <dt className="text-[#6f6f6f]">Mã</dt>
          <dd className="mt-1 break-all font-semibold">{record.certificateCode}</dd>
        </div>
      </dl>
    </div>
  );
}

export function CertificateScreen({ profile, progress, equippedSkin }) {
  const certificates = CertificateManager.syncAndGetCertificates(profile, progress);
  const [viewId, setViewId] = useState(null);
  const viewing = certificates.find((c) => c.requirement.id === viewId && c.record);

  const accuracyPercent =
    progress.totalQuestionsAnswered > 0
      ? Math.round(
          (progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100
        )
      : 0;

  const stats = [
    { label: 'Kỷ lục', value: progress.highScore, color: 'var(--color-sun-deep)' },
    { label: 'Câu đúng', value: progress.totalCorrectAnswers, color: 'var(--color-leaf-deep)' },
    { label: 'Chính xác', value: `${accuracyPercent}%`, color: 'var(--color-sky)' },
    { label: 'Cột mốc', value: progress.milestonesPassedCount, color: 'var(--color-grape)' },
  ];

  return (
    <div className="mx-auto max-w-[480px] px-4 pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <h1 className="font-pixel text-[46px] font-extrabold leading-none text-ink">Chứng chỉ</h1>

      <dl className="mt-6 grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="pixel-box px-4 py-3">
            <dt className="text-[13px] text-muted">{s.label}</dt>
            <dd className="font-pixel text-[36px] font-bold leading-none" style={{ color: s.color }}>
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="mt-8 grid gap-5">
        {certificates.map((cert) => {
          const req = cert.requirement;
          return (
            <li key={req.id} className="pixel-box p-4">
              <div className="flex items-start gap-3">
                <span
                  className="grid size-12 shrink-0 place-items-center"
                  style={{
                    backgroundColor: cert.isEarned ? BADGE_COLORS[req.badgeLevel] : 'var(--color-rule)',
                  }}
                >
                  <PixelSprite
                    rows={ICONS.medal}
                    size={24}
                    color={cert.isEarned ? '#1f1f1f' : 'var(--color-muted)'}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-semibold leading-snug text-text">{req.title}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">{req.description}</p>
                </div>
              </div>

              {cert.isEarned && cert.record ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setViewId(req.id);
                  }}
                  className="pixel-btn pixel-btn-sky mt-4 min-h-12 w-full text-[22px]"
                >
                  Xem chứng chỉ
                </button>
              ) : (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {getRequirementChecks(req, progress).map((check) => {
                    const done = check.current >= check.target;
                    return (
                      <li
                        key={check.label}
                        className={`flex items-center gap-1.5 px-2 py-1 text-[13px] font-semibold ${
                          done ? 'bg-leaf-soft text-leaf-deep' : 'bg-paper text-muted'
                        }`}
                      >
                        {done && <PixelSprite rows={ICONS.check} size={11} />}
                        {check.label} {Math.min(check.current, check.target)}/{check.target}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <Sheet open={Boolean(viewing)} title="Chứng chỉ" onClose={() => setViewId(null)}>
        {viewing && (
          <>
            <CertificateDocument cert={viewing} skin={equippedSkin} />
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                window.print();
              }}
              className="pixel-btn mt-7 w-full"
            >
              <PixelSprite rows={ICONS.print} size={20} />
              In hoặc lưu PDF
            </button>
          </>
        )}
      </Sheet>

      {/* Bản in riêng nằm ngoài #root để chỉ in đúng chứng chỉ */}
      {viewing &&
        createPortal(
          <div className="print-area hidden print:block">
            <CertificateDocument cert={viewing} skin={equippedSkin} />
          </div>,
          document.body
        )}
    </div>
  );
}
