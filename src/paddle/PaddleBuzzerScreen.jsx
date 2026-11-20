import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PADDLE_BUZZER } from '../../data/config/game-config';
import { ICONS } from '../game/pixel-art';
import { QuestionController } from '../game/question-controller';
import { LETTERS, LETTER_COLORS, renderMarked } from '../ui/answer-format';
import { PixelBar } from '../ui/PixelBar';
import { PixelSprite } from '../ui/PixelSprite';
import { shuffleArray } from '../utils/random';
import { soundFX } from '../utils/sound';
import { detectPaddles } from './marker-detector';
import { PaddleGame } from './paddle-game';
import { PaddlePrintSheet } from './PaddlePrintSheet';

const LOW_TIME_SEC = 5;
const GROUP_COUNT = PADDLE_BUZZER.groupCount;
const GROUPS = Array.from({ length: GROUP_COUNT }, (_, i) => i);

const HOW_TO = [
  'Đặt máy trên bàn giáo viên, màn hình và camera quay về phía lớp.',
  'Giáo viên đọc câu hỏi rồi nhấn Space: chuông kêu và bốn đáp án hiện ra. Mỗi nhóm xoay bảng cho chữ của đáp án nằm trên cùng rồi giơ lên.',
  `Đúng được ${PADDLE_BUZZER.correctPoints} điểm, nhóm đúng và nhanh nhất được thêm ${PADDLE_BUZZER.fastestBonus} điểm. Đã giơ thì không đổi được.`,
];

// stage: cỡ chữ tính theo chiều cao màn hình, dùng lúc đang chơi
function GroupChip({ group, fill, dim, note, stage = false }) {
  return (
    <li
      className={`pixel-box grid place-items-center px-1 py-1 text-center text-text ${stage ? 'min-h-0' : 'min-h-14'}`}
      style={{ '--fill': fill, opacity: dim ? 0.45 : 1 }}
    >
      <span className={`font-pixel font-bold leading-none ${stage ? 'text-[4.6vh]' : 'text-[28px]'}`}>
        {group + 1}
      </span>
      <span className={`font-semibold leading-none ${stage ? 'min-h-[2vh] text-[2vh]' : 'min-h-4 text-[13px]'}`}>
        {note}
      </span>
    </li>
  );
}

/**
 * Chữ tự phóng to hết cỡ mà vẫn nằm gọn trong khung, để hàng bàn cuối đọc được.
 * Khung phải có kích thước do bố cục quyết định (không co giãn theo chữ); fitKey đổi thì đo lại.
 */
function FitText({ fitKey, className, children }) {
  const boxRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    const fit = () => {
      let low = 12;
      let high = box.clientHeight;
      while (high - low > 1) {
        const mid = (low + high) >> 1;
        text.style.fontSize = `${mid}px`;
        if (text.offsetHeight <= box.clientHeight && text.scrollWidth <= box.clientWidth) low = mid;
        else high = mid;
      }
      text.style.fontSize = `${low}px`;
    };
    fit();
    // Khung đổi cỡ khi bốn đáp án hiện ra hoặc cửa sổ đổi kích thước
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [fitKey]);

  return (
    <div ref={boxRef} className={`flex items-center overflow-hidden ${className}`}>
      <p ref={textRef} className="w-full">
        {children}
      </p>
    </div>
  );
}

/**
 * Paddle Buzzer: thi theo nhóm bằng bảng bìa có mã vuông, dùng kho câu hỏi của trò khủng long.
 * Máy đặt quay về phía lớp; camera nhận nhóm nào giơ bảng và cạnh nào quay lên trên (A/B/C/D).
 * Giáo viên đọc câu hỏi; Space hoặc Enter chuyển bước: hiện đáp án → chốt sớm → câu tiếp.
 * Lúc chơi, câu hỏi và đáp án chiếm trọn màn hình với cỡ chữ lớn nhất có thể.
 */
export function PaddleBuzzerScreen({ onExit }) {
  const videoRef = useRef(null);
  const gameRef = useRef(null);
  const frameHandlerRef = useRef(null);
  const stepHandlerRef = useRef(null);
  const seenKeyRef = useRef('');
  const secondRef = useRef(0);
  // Luật chơi nằm trong PaddleGame (ngoài React); gọi rerender mỗi khi nó đổi trạng thái
  const [, rerender] = useReducer((n) => n + 1, 0);
  const [pool] = useState(() => new QuestionController().gameplayPool);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  // Màn chuẩn bị: bảng camera đang thấy (số mã → đáp án)
  const [seen, setSeen] = useState(() => new Map());

  const game = gameRef.current;
  const phase = game ? game.phase : 'SETUP';

  const openAnswers = () => {
    const g = gameRef.current;
    if (!g || g.phase !== 'READING') return;
    g.open(performance.now());
    secondRef.current = PADDLE_BUZZER.answerTimeSec;
    soundFX.playPowerUp();
    rerender();
  };

  const announceReveal = () => {
    const g = gameRef.current;
    if (g.correctGroups.length > 0) soundFX.playCorrect();
    else soundFX.playWrong();
    rerender();
  };

  const closeAnswers = () => {
    const g = gameRef.current;
    if (!g || g.phase !== 'OPEN') return;
    g.reveal();
    announceReveal();
  };

  const nextQuestion = () => {
    const g = gameRef.current;
    if (!g || g.phase !== 'REVEAL') return;
    g.next();
    if (g.phase === 'FINAL') soundFX.playMilestonePass();
    rerender();
  };

  const startGame = () => {
    soundFX.playClick();
    gameRef.current = new PaddleGame(
      shuffleArray(pool).slice(0, PADDLE_BUZZER.questionCount),
      GROUP_COUNT
    );
    // Toàn màn hình để chữ to nhất có thể; không vào được thì vẫn chơi bình thường
    document.documentElement.requestFullscreen().catch(() => {});
    rerender();
  };

  const backToSetup = () => {
    soundFX.playClick();
    if (document.fullscreenElement) document.exitFullscreen();
    gameRef.current = null;
    rerender();
  };

  stepHandlerRef.current = () => {
    if (phase === 'READING') openAnswers();
    else if (phase === 'OPEN') closeAnswers();
    else if (phase === 'REVEAL') nextQuestion();
  };

  frameHandlerRef.current = (paddles, now) => {
    const g = gameRef.current;
    if (!g) {
      const key = paddles
        .map((p) => `${p.id}:${p.answer}`)
        .sort()
        .join(' ');
      if (key !== seenKeyRef.current) {
        seenKeyRef.current = key;
        setSeen(new Map(paddles.map((p) => [p.id, p.answer])));
      }
      return;
    }
    const changed = g.update(paddles, now);
    if (g.phase === 'REVEAL' && changed) {
      announceReveal();
      return;
    }
    if (g.phase !== 'OPEN') return;
    if (changed) soundFX.playClick();
    const second = Math.ceil(g.secondsLeft(now));
    if (changed || second !== secondRef.current) {
      secondRef.current = second;
      rerender();
    }
  };

  // Mở camera và quét mã mỗi khung hình; nhạc nền tắt để lớp nghe rõ giáo viên đọc đề
  useEffect(() => {
    soundFX.stopBgm();
    if (!navigator.mediaDevices) {
      setCameraError('Trình duyệt chỉ cho dùng camera trên địa chỉ https hoặc localhost.');
      return undefined;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let stream = null;
    let frameId = null;
    let cancelled = false;

    const scan = () => {
      frameId = window.requestAnimationFrame(scan);
      if (video.readyState < video.HAVE_CURRENT_DATA) return;
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      ctx.drawImage(video, 0, 0);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      frameHandlerRef.current(detectPaddles(frame), performance.now());
    };

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
      })
      .then((opened) => {
        if (cancelled) {
          opened.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = opened;
        video.srcObject = opened;
        setCameraReady(true);
        frameId = window.requestAnimationFrame(scan);
      })
      .catch((err) => {
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Trình duyệt chưa được phép dùng camera. Cho phép camera rồi tải lại trang.'
            : `Không mở được camera: ${err.message}`
        );
      });

    return () => {
      cancelled = true;
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (document.fullscreenElement) document.exitFullscreen();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat || (e.code !== 'Space' && e.code !== 'Enter')) return;
      const current = gameRef.current?.phase;
      if (!current || current === 'FINAL') return;
      e.preventDefault();
      stepHandlerRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setup = phase === 'SETUP';
  const seenCount = [...seen.keys()].filter((id) => id < GROUP_COUNT).length;
  const question = game && phase !== 'FINAL' ? game.question : null;

  let stepLabel = 'Hiện đáp án';
  if (phase === 'OPEN') stepLabel = 'Chốt sớm';
  else if (phase === 'REVEAL') {
    stepLabel = game.index + 1 < game.questions.length ? 'Câu tiếp' : 'Xem kết quả';
  }

  const chipFor = (group) => {
    if (setup) {
      const answer = seen.get(group);
      return answer === undefined
        ? { note: '' }
        : { fill: 'var(--color-sun)', note: LETTERS[answer] };
    }
    const lock = game.locked.get(group);
    if (phase !== 'REVEAL') {
      return lock ? { fill: 'var(--color-sun)', note: 'xong' } : { note: '' };
    }
    const score = `${game.scores[group]}đ`;
    if (!lock) return { dim: true, note: score };
    const picked = `${LETTERS[lock.answer]} · ${score}`;
    if (group === game.fastestGroup) return { fill: 'var(--color-sun)', note: picked };
    return game.correctGroups.includes(group)
      ? { fill: 'var(--color-leaf-soft)', note: picked }
      : { fill: 'var(--color-berry-soft)', note: picked };
  };

  // Ba bố cục: chuẩn bị và kết quả cuộn như trang thường; lúc hỏi đáp thì phủ kín màn hình
  let rootClass = 'mx-auto max-w-[1100px] px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-8';
  let bodyClass = '';
  let cameraClass = 'fixed bottom-3 right-3 z-30 w-44';
  if (setup) {
    bodyClass = 'mt-3 grid gap-6 md:grid-cols-[3fr_2fr]';
    cameraClass = '';
  } else if (question) {
    rootClass = 'fixed inset-0 z-20 flex flex-col gap-[1.5vh] bg-paper p-[1.5vh]';
    bodyClass = 'flex min-h-0 flex-1 flex-col gap-[1.5vh]';
    cameraClass = 'absolute bottom-[1.5vh] right-[1.5vh] w-[13vw]';
  }

  return (
    <div className={rootClass}>
      <header className={`flex shrink-0 items-center gap-[1.5vw] ${question ? 'h-[7vh]' : 'h-12'}`}>
        <button
          type="button"
          onClick={setup ? onExit : backToSetup}
          aria-label={setup ? 'Về trang chính' : 'Dừng lượt chơi'}
          className="grid size-11 shrink-0 place-items-center text-ink"
        >
          <PixelSprite rows={ICONS.back} size={22} />
        </button>
        {!question && <h1 className="font-pixel text-[30px] font-bold leading-none text-ink">Paddle Buzzer</h1>}
        {question && (
          <>
            <p className="shrink-0 font-pixel text-[4.5vh] font-bold leading-none tabular-nums text-muted">
              Câu {game.index + 1}/{game.questions.length}
            </p>
            <div className="flex min-w-0 flex-1 items-center gap-[1.5vw]">
              {phase === 'READING' && (
                <p className="truncate font-pixel text-[4.5vh] font-bold leading-none text-muted animate-blink">
                  Nghe đọc câu hỏi, chưa giơ bảng
                </p>
              )}
              {phase === 'OPEN' && (
                <>
                  <PixelBar
                    value={secondRef.current / PADDLE_BUZZER.answerTimeSec}
                    color={secondRef.current <= LOW_TIME_SEC ? 'var(--color-berry)' : 'var(--color-leaf)'}
                    label="Thời gian còn lại"
                    className="h-[2.5vh] flex-1"
                  />
                  <span className="w-[8vh] text-right font-pixel text-[6.5vh] font-bold leading-none tabular-nums text-ink">
                    {secondRef.current}
                  </span>
                </>
              )}
              {phase === 'REVEAL' && (
                <p className="truncate font-pixel text-[4.5vh] font-bold leading-none text-leaf-deep">
                  Đáp án {LETTERS[question.c]}
                  {game.fastestGroup !== null && ` · Nhóm ${game.fastestGroup + 1} nhanh nhất`}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                // Bỏ focus để phím Space không bấm lại chính nút này ở bước sau
                e.currentTarget.blur();
                stepHandlerRef.current();
              }}
              className="pixel-btn h-[5.5vh] min-h-0 shrink-0 px-[1.2vw] text-[3.2vh]"
            >
              {stepLabel}
              <span className="text-[2.2vh] font-medium">(Space)</span>
            </button>
          </>
        )}
      </header>

      <div className={bodyClass}>
        {/* Camera luôn bật: màn chuẩn bị xem to để canh khung hình, lúc chơi thu nhỏ ở góc */}
        <div className={cameraClass}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="pixel-box block aspect-video w-full bg-ink object-cover"
          />
          {setup && (
            <>
              <p className="mt-4 text-[15px] text-muted" aria-live="polite">
                {cameraError ??
                  (cameraReady
                    ? `Camera đang thấy ${seenCount}/${GROUP_COUNT} bảng. Giơ thử từng bảng để kiểm tra.`
                    : 'Đang mở camera…')}
              </p>
              <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-3">
                {GROUPS.map((group) => (
                  <GroupChip key={group} group={group} {...chipFor(group)} />
                ))}
              </ul>
            </>
          )}
        </div>

        {setup && (
          <div>
            <p className="text-[14px] leading-relaxed text-muted">
              Lớp chia {GROUP_COUNT} nhóm, mỗi dãy bàn là một nhóm cầm một bảng. Mỗi lượt {PADDLE_BUZZER.questionCount} câu lấy ngẫu nhiên từ {pool.length} câu Unit 1-5 của trò
              khủng long, {PADDLE_BUZZER.answerTimeSec} giây mỗi câu.
            </p>

            <div className="mt-6 grid gap-5">
              <button
                type="button"
                onClick={startGame}
                disabled={!cameraReady}
                className="pixel-btn min-h-16 w-full text-[32px]"
              >
                <PixelSprite rows={ICONS.play} size={22} />
                Bắt đầu
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  window.print();
                }}
                className="pixel-btn pixel-btn-quiet w-full"
              >
                <PixelSprite rows={ICONS.print} size={20} />
                In {GROUP_COUNT} bảng
              </button>
            </div>

            <ol className="mt-7 grid gap-3">
              {HOW_TO.map((line, idx) => (
                <li key={line} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center bg-sun font-pixel text-[20px] font-bold text-[#1f1f1f]">
                    {idx + 1}
                  </span>
                  <p className="text-[15px] leading-relaxed text-text">{line}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {question && (
          <>
            {/* Lúc đọc đề, câu hỏi chiếm cả màn hình; bốn đáp án chỉ hiện khi đã mở trả lời */}
            <FitText
              // Đo lại ngay khi bốn đáp án hiện ra và khung câu hỏi thu nhỏ
              fitKey={`${question.q}|${phase === 'READING'}`}
              className={`min-h-0 whitespace-pre-line font-semibold leading-tight text-text ${
                phase === 'READING' ? 'flex-1' : 'flex-[2]'
              }`}
            >
              {renderMarked(question.q)}
            </FitText>

            {phase !== 'READING' && (
              <ul className="grid min-h-0 flex-[3] grid-cols-2 grid-rows-2 gap-[1.5vh]">
                {question.a.map((option, idx) => {
                  const correct = phase === 'REVEAL' && idx === question.c;
                  return (
                    <li
                      key={`${idx}-${option}`}
                      className="pixel-box flex min-h-0 items-center gap-[1.2vw] px-[1vw]"
                      style={{
                        '--fill': correct ? 'var(--color-leaf-soft)' : undefined,
                        '--edge': correct ? 'var(--color-leaf)' : undefined,
                        opacity: phase === 'REVEAL' && !correct ? 0.35 : 1,
                      }}
                    >
                      <span
                        className="grid size-[12vh] shrink-0 place-items-center font-pixel text-[10vh] font-bold leading-none text-[#1f1f1f]"
                        style={{ backgroundColor: LETTER_COLORS[idx] }}
                      >
                        {LETTERS[idx]}
                      </span>
                      <FitText
                        fitKey={option}
                        className="min-w-0 flex-1 self-stretch font-semibold leading-tight text-text"
                      >
                        {renderMarked(option)}
                      </FitText>
                    </li>
                  );
                })}
              </ul>
            )}

            <ul
              className="grid h-[9vh] shrink-0 gap-[0.7vw] pr-[14.5vw]"
              style={{ gridTemplateColumns: `repeat(${GROUP_COUNT}, minmax(0, 1fr))` }}
            >
              {GROUPS.map((group) => (
                <GroupChip key={group} group={group} stage {...chipFor(group)} />
              ))}
            </ul>
          </>
        )}

        {phase === 'FINAL' && (
          <div className="mx-auto mt-4 max-w-[560px] text-center">
            <p className="font-pixel text-[46px] font-extrabold leading-none text-ink">Kết quả</p>
            <ol className="mt-6 grid gap-3 text-left">
              {GROUPS.map((group) => ({ group, score: game.scores[group] }))
                .sort((a, b) => b.score - a.score)
                .map(({ group, score }, rank, ranking) => (
                  <li
                    key={group}
                    className="pixel-box flex items-center gap-4 px-4 py-2"
                    // Tô vàng mọi nhóm đồng hạng nhất, trừ khi chưa nhóm nào có điểm
                    style={{
                      '--fill': score > 0 && score === ranking[0].score ? 'var(--color-sun)' : undefined,
                    }}
                  >
                    <span className="w-8 font-pixel text-[26px] font-bold tabular-nums text-muted">
                      {rank + 1}
                    </span>
                    <span className="flex-1 font-pixel text-[30px] font-bold text-text">Nhóm {group + 1}</span>
                    <span className="font-pixel text-[30px] font-bold tabular-nums text-text">{score}đ</span>
                  </li>
                ))}
            </ol>
            <div className="mt-8 grid gap-5">
              <button type="button" onClick={backToSetup} className="pixel-btn w-full">
                <PixelSprite rows={ICONS.restart} size={20} />
                Chơi lượt mới
              </button>
              <button type="button" onClick={onExit} className="pixel-btn pixel-btn-quiet w-full">
                Về trang chính
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bản in riêng nằm ngoài #root để chỉ in đúng các bảng */}
      {setup &&
        createPortal(
          <div className="print-area hidden print:block">
            <PaddlePrintSheet groupCount={GROUP_COUNT} />
          </div>,
          document.body
        )}
    </div>
  );
}
