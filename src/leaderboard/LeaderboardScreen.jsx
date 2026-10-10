import React, { useEffect, useState } from 'react';
import { SKIN_DEFINITIONS } from '../../data/skins/skins.js';
import { ApiClient } from '../services/api-client.js';
import { DinoAvatar } from '../skins/DinoAvatar.jsx';

// Màu & chiều cao bục cho Top 3 (bục nhất ở giữa)
const PODIUM = {
  1: { color: 'var(--color-sun)', height: 76, avatar: 76 },
  2: { color: '#d4d4d4', height: 54, avatar: 60 },
  3: { color: '#f0a46a', height: 40, avatar: 60 },
};

export function LeaderboardScreen({ profile, equippedSkin }) {
  const [board, setBoard] = useState(null);
  const [failed, setFailed] = useState(false);

  // Tải bảng xếp hạng và tự làm mới khi bảng trực tuyến thay đổi
  useEffect(() => {
    let active = true;
    let refreshTimer = null;

    const load = () => {
      ApiClient.getLeaderboard(profile)
        .then((res) => {
          if (!active) return;
          setBoard(res);
          setFailed(false);
        })
        .catch((err) => {
          console.warn('[LeaderboardScreen] Không tải được bảng xếp hạng.', err);
          if (active) setFailed(true);
        });
    };
    // Gom nhiều thay đổi liên tiếp thành một lần tải lại
    const scheduleLoad = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(load, 400);
    };

    load();
    const unsubscribe = ApiClient.subscribeLeaderboard(scheduleLoad);
    return () => {
      active = false;
      window.clearTimeout(refreshTimer);
      unsubscribe();
    };
  }, [profile]);

  // Người chơi hiện tại luôn hiển thị skin đang dùng
  const skinOf = (entry) =>
    entry.isCurrentPlayer
      ? equippedSkin
      : SKIN_DEFINITIONS.find((s) => s.id === entry.skinId) || SKIN_DEFINITIONS[0];

  const entries = board?.entries ?? [];
  const me = board?.me ?? null;
  const online = ApiClient.isOnline();
  const podium = [1, 0, 2].map((i) => entries[i]).filter(Boolean);

  let status = null;
  if (failed && !board) status = 'Không tải được bảng xếp hạng. Kiểm tra kết nối mạng rồi mở lại.';
  else if (!board) status = 'Đang tải bảng xếp hạng...';
  else if (entries.length === 0) status = 'Chưa có ai trên bảng. Chơi một lượt để mở màn!';

  return (
    <div className="mx-auto max-w-[480px] px-4 pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <h1 className="font-pixel text-[46px] font-extrabold leading-none text-ink">Xếp hạng</h1>
      <p className="mt-2 text-[15px] text-muted">Theo số câu đúng nhiều nhất trong một lượt chơi.</p>

      <div
        className="pixel-box mt-6 flex min-h-[72px] items-center justify-between gap-4 px-4"
        style={{ '--fill': 'var(--color-sky)' }}
      >
        {me ? (
          <>
            <div className="text-white">
              <p className="text-[15px] font-semibold">Hạng của bạn</p>
              <p className="text-[13px] opacity-90">Kỷ lục {me.highScore} câu đúng</p>
            </div>
            <p className="font-pixel text-[48px] font-extrabold leading-none text-white">#{me.rank}</p>
          </>
        ) : (
          <p className="text-[15px] font-semibold text-white">
            Chơi một lượt để có tên trên bảng.
          </p>
        )}
      </div>

      {status && (
        <output className="mt-10 block text-center font-pixel text-[24px] font-bold text-muted">
          {status}
        </output>
      )}

      {/* Bục Top 3 cùng skin của từng người */}
      {podium.length > 0 && (
        <ol className="mt-8 grid grid-cols-3 items-end gap-4">
          {podium.map((entry) => {
            const spot = PODIUM[entry.rank] ?? PODIUM[3];
            return (
              <li key={entry.id} className="flex min-w-0 flex-col items-center text-center">
                <DinoAvatar skin={skinOf(entry)} size={spot.avatar} animated={entry.rank === 1} />
                <div className="mt-1 flex min-h-[2.5em] w-full flex-col justify-end text-[13px] leading-tight">
                  <p className="line-clamp-2 font-semibold text-text">
                    {entry.fullName}
                    {entry.isCurrentPlayer && <span className="text-sky"> (bạn)</span>}
                  </p>
                </div>
                <p className="font-pixel text-[24px] font-bold leading-none text-ink">{entry.highScore}</p>
                <div
                  className="pixel-box mt-2 flex w-full justify-center pt-1 font-pixel text-[32px] font-extrabold leading-none text-[#1f1f1f]"
                  style={{ '--fill': spot.color, height: spot.height }}
                >
                  {entry.rank}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <ol className="mt-8 grid gap-4">
        {entries.slice(3).map((entry) => (
          <li
            key={entry.id}
            className="pixel-box flex items-center gap-3 py-1.5 pr-3 pl-2"
            style={
              entry.isCurrentPlayer
                ? { '--fill': 'var(--color-sun-soft)', '--edge': 'var(--color-sun-deep)' }
                : undefined
            }
          >
            <span className="w-8 shrink-0 text-center font-pixel text-[26px] font-bold text-ink">
              {entry.rank}
            </span>
            <DinoAvatar skin={skinOf(entry)} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold text-text">
                {entry.fullName}
                {entry.isCurrentPlayer && <span className="font-normal text-muted"> (bạn)</span>}
              </p>
              <p className="text-[13px] text-muted">Lớp {entry.className}</p>
            </div>
            <span className="font-pixel text-[28px] font-bold tabular-nums text-ink">
              {entry.highScore}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-7 text-center text-[13px] text-muted">
        {online
          ? 'Bảng xếp hạng trực tuyến, tự cập nhật khi có người lập kỷ lục mới.'
          : 'Bảng xếp hạng lưu trên máy này, kèm vài tên mẫu để tham khảo.'}
      </p>
    </div>
  );
}
