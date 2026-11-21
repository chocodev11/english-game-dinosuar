import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PADDLE_BUZZER } from '../../data/config/game-config';
import { ICONS } from '../game/pixel-art';
import { QuestionController } from '../game/question-controller';
import { LETTERS, LETTER_COLORS, renderMarked } from '../ui/answer-format';
import { PixelBar } from '../ui/PixelBar';
import { PixelSprite } from '../ui/PixelSprite';
import { SoundSettings } from '../ui/SoundSettings';
import { shuffleArray } from '../utils/random';
import { soundFX } from '../utils/sound';
import { PaddleGame } from './paddle-game';
import { PaddleScanner } from './paddle-scanner';
import { PaddlePrintSheet } from './PaddlePrintSheet';

const LOW_TIME_SEC = 5;
const GROUP_COUNT = PADDLE_BUZZER.groupCount;
const GROUPS = Array.from({ length: GROUP_COUNT }, (_, i) => i);
// Ở màn chuẩn bị, bảng phải được thấy liền chừng này lần quét mới hiện, để một lần nhận nhầm đồ vật không bị tính là đã thấy nhóm
const STEADY_SCANS = 3;
// Bước công bố xếp ảnh các nhóm theo tốc độ, mỗi hàng PODIUM_SIZE nhóm; PODIUM_SIZE nhóm đúng và nhanh nhất được viền nổi bật
const PODIUM_SIZE = 3;
const PODIUM_FRAME = '0 0 0 0.9vh var(--color-sun), 0 0 0 calc(0.9vh + 3px) var(--color-ink)';
// Thời gian dừng ở mỗi hàng ảnh trước khi tự cuộn xuống hàng kế
const REVEAL_SCROLL_MS = 2600;
// Ảnh chụp nhóm lúc chốt: vùng vuông rộng gấp PHOTO_SPAN lần cạnh bảng, lệch xuống dưới để thấy cả người cầm
const PHOTO_SPAN = 3;
const PHOTO_PX = 320;

// Cắt vùng quanh bảng từ khung hình camera hiện tại; ảnh chỉ nằm trong bộ nhớ trang và bị bỏ khi sang câu khác
function capturePhoto(video, corners) {
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const side = Math.max(Math.max(...xs) - left, Math.max(...ys) - top);
  const size = side * PHOTO_SPAN;

  const canvas = document.createElement('canvas');
  canvas.width = PHOTO_PX;
  canvas.height = PHOTO_PX;
  canvas
    .getContext('2d')
    .drawImage(video, left + side / 2 - size / 2, top + side / 2 - size * 0.35, size, size, 0, 0, PHOTO_PX, PHOTO_PX);
  return canvas.toDataURL('image/jpeg', 0.8);
}

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
      <span className={`font-pixel font-bold leading-none ${stage ? 'text-[7.5vh]' : 'text-[28px]'}`}>
        {group + 1}
      </span>
      <span className={`font-semibold leading-none ${stage ? 'min-h-[2.6vh] text-[2.6vh]' : 'min-h-4 text-[13px]'}`}>
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
  // Số lần quét liền nhau gần nhất thấy từng bảng ở màn chuẩn bị (mã → số lần)
  const streaksRef = useRef(new Map());
  // Nhóm đã được camera thấy ít nhất một lần ở màn chuẩn bị, để biết chỗ đặt máy đã bao hết lớp chưa
  const checkedRef = useRef(new Set());
  // Ảnh chụp từng nhóm lúc chốt đáp án của câu hiện tại (nhóm → ảnh)
  const photosRef = useRef(new Map());
  const rankListRef = useRef(null);
  const secondRef = useRef(0);
  // Luật chơi nằm trong PaddleGame (ngoài React); gọi rerender mỗi khi nó đổi trạng thái
  const [, rerender] = useReducer((n) => n + 1, 0);
  const [pool] = useState(() => new QuestionController().gameplayPool);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  // Độ phân giải và số lần quét mỗi giây, hiện ở màn chuẩn bị để biết máy có theo kịp camera không
  const [scanInfo, setScanInfo] = useState('');
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
    photosRef.current = new Map();
    if (g.phase === 'FINAL') soundFX.playMilestonePass();
    rerender();
  };

  const startGame = () => {
    soundFX.playClick();
    gameRef.current = new PaddleGame(
      shuffleArray(pool).slice(0, PADDLE_BUZZER.questionCount),
      GROUP_COUNT
    );
    photosRef.current = new Map();
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
      streaksRef.current = new Map(paddles.map((p) => [p.id, (streaksRef.current.get(p.id) ?? 0) + 1]));
      const steady = paddles.filter((p) => streaksRef.current.get(p.id) >= STEADY_SCANS);
      const key = steady
        .map((p) => `${p.id}:${p.answer}`)
        .sort()
        .join(' ');
      if (key !== seenKeyRef.current) {
        seenKeyRef.current = key;
        for (const p of steady) checkedRef.current.add(p.id);
        setSeen(new Map(steady.map((p) => [p.id, p.answer])));
      }
      return;
    }
    const changed = g.update(paddles, now);
    if (changed) {
      // Nhóm vừa chốt ở khung hình này thì chụp luôn vùng quanh bảng của nhóm
      for (const p of paddles) {
        if (g.locked.has(p.id) && !photosRef.current.has(p.id)) {
          photosRef.current.set(p.id, capturePhoto(videoRef.current, p.corners));
        }
      }
    }
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

  // Nhạc nền chỉ chạy lúc đếm giờ trả lời và ở bảng kết quả; các lúc khác tắt để lớp nghe rõ giáo viên
  useEffect(() => {
    if (phase === 'OPEN' || phase === 'FINAL') soundFX.startBgm();
    else soundFX.stopBgm();
  }, [phase]);

  // Mở camera và quét mã theo từng khung hình camera
  useEffect(() => {
    if (!navigator.mediaDevices) {
      setCameraError('Trình duyệt chỉ cho dùng camera trên địa chỉ https hoặc localhost.');
      return undefined;
    }

    const video = videoRef.current;
    const scanner = new PaddleScanner();
    let stream = null;
    let cancelled = false;

    // Chờ camera có khung hình mới; trình duyệt không có requestVideoFrameCallback thì theo nhịp vẽ màn hình
    const nextFrame = () =>
      new Promise((resolve) => {
        if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(resolve);
        else window.requestAnimationFrame(resolve);
      });

    const scanLoop = async () => {
      let scans = 0;
      let countedFrom = performance.now();
      while (!cancelled) {
        await nextFrame();
        if (cancelled || video.readyState < video.HAVE_CURRENT_DATA) continue;
        // Tính giờ theo lúc chụp khung hình chứ không phải lúc quét xong, để xếp nhanh chậm cho đúng
        const capturedAt = performance.now();
        const paddles = await scanner.scan(video);
        if (cancelled) return;
        frameHandlerRef.current(paddles, capturedAt);

        scans += 1;
        if (capturedAt - countedFrom >= 1000) {
          const perSecond = Math.round((scans * 1000) / (capturedAt - countedFrom));
          setScanInfo(`${video.videoWidth}×${video.videoHeight}, quét ${perSecond} lần/giây`);
          scans = 0;
          countedFrom = capturedAt;
        }
      }
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
        scanLoop().catch((err) => setCameraError(`Lỗi khi quét bảng: ${err.message}`));
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
      scanner.close();
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
  const unchecked = GROUPS.filter((group) => !checkedRef.current.has(group));
  const question = game && phase !== 'FINAL' ? game.question : null;
  const questionIndex = game ? game.index : -1;

  // Lúc công bố: tự cuộn từng hàng ảnh từ nhóm nhanh nhất xuống nhóm chậm nhất, hết thì quay về đầu
  useEffect(() => {
    if (phase !== 'REVEAL') return undefined;
    const list = rankListRef.current;
    let row = 0;
    const timer = window.setInterval(() => {
      row += 1;
      const first = list.children[row * PODIUM_SIZE];
      if (!first) {
        window.clearInterval(timer);
        list.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      list.scrollTo({ top: first.offsetTop - list.children[0].offsetTop, behavior: 'smooth' });
    }, REVEAL_SCROLL_MS);
    return () => window.clearInterval(timer);
  }, [phase, questionIndex]);

  const podium = phase === 'REVEAL' ? game.correctGroups.slice(0, PODIUM_SIZE) : [];
  // Các nhóm đã chốt, xếp từ nhanh đến chậm
  const finishers = phase === 'REVEAL' ? [...game.locked].sort((a, b) => a[1].at - b[1].at) : [];

  let stepLabel = 'Hiện đáp án';
  if (phase === 'OPEN') stepLabel = 'Chốt sớm';
  else if (phase === 'REVEAL') {
    stepLabel = game.index + 1 < game.questions.length ? 'Câu tiếp' : 'Xem kết quả';
  }

  const chipFor = (group) => {
    if (setup) {
      const answer = seen.get(group);
      if (answer !== undefined) return { fill: 'var(--color-sun)', note: LETTERS[answer] };
      return checkedRef.current.has(group) ? { fill: 'var(--color-leaf-soft)', note: 'đã thấy' } : { note: '' };
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
    // Cao bằng hàng ô nhóm (13vh, tỉ lệ 16:9) để không đè lên ô đáp án
    cameraClass = 'absolute bottom-[1.5vh] right-[1.5vh] w-[23vh]';
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
                    ? `Cho mỗi nhóm giơ bảng một lần để chắc camera thấy hết lớp, kể cả bàn cuối. Đã thấy ${
                        GROUP_COUNT - unchecked.length
                      }/${GROUP_COUNT} nhóm${unchecked.length > 0 ? `, còn thiếu nhóm ${unchecked.map((group) => group + 1).join(', ')}` : ''}.`
                    : 'Đang mở camera…')}
              </p>
              {scanInfo && <p className="mt-1 text-[13px] text-muted">Camera {scanInfo}.</p>}
              <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-3">
                {GROUPS.map((group) => (
                  <GroupChip key={group} group={group} {...chipFor(group)} />
                ))}
              </ul>
              {checkedRef.current.size > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    checkedRef.current = new Set();
                    rerender();
                  }}
                  className="mt-2 min-h-11 text-[15px] font-semibold text-sky"
                >
                  Kiểm tra lại từ đầu
                </button>
              )}
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

            {/* Kéo thanh nhạc nền sẽ phát thử ngay để chỉnh cho vừa lớp */}
            <div className="mt-6">
              <SoundSettings />
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
              <div className="flex min-h-0 flex-[3] gap-[1.5vh]">
                {/* Lúc công bố, bốn đáp án dồn sang trái thành một cột để nhường chỗ cho ảnh các nhóm */}
                <ul
                  className={`grid min-h-0 gap-[1.5vh] ${
                    phase === 'REVEAL' ? 'flex-[2] grid-rows-4' : 'flex-1 grid-cols-2 grid-rows-2'
                  }`}
                >
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
                          className={`grid shrink-0 place-items-center font-pixel font-bold leading-none text-[#1f1f1f] ${
                            phase === 'REVEAL' ? 'size-[8vh] text-[6.5vh]' : 'size-[12vh] text-[10vh]'
                          }`}
                          style={{ backgroundColor: LETTER_COLORS[idx] }}
                        >
                          {LETTERS[idx]}
                        </span>
                        <FitText
                          // Đo lại ngay khi ô đáp án đổi cỡ lúc công bố
                          fitKey={`${option}|${phase}`}
                          className="min-w-0 flex-1 self-stretch font-semibold leading-tight text-text"
                        >
                          {renderMarked(option)}
                        </FitText>
                      </li>
                    );
                  })}
                </ul>

                {phase === 'REVEAL' && (
                  <ol
                    ref={rankListRef}
                    className="relative grid min-h-0 flex-[3] auto-rows-[100%] grid-cols-3 gap-[3vh] overflow-y-auto p-[1.2vh] [scrollbar-width:none]"
                  >
                    {finishers.map(([group, lock], rank) => {
                      const correct = game.correctGroups.includes(group);
                      const photo = photosRef.current.get(group);
                      const seconds = ((lock.at - game.openedAt) / 1000).toFixed(1).replace('.', ',');
                      let style = { '--fill': correct ? 'var(--color-leaf-soft)' : 'var(--color-berry-soft)' };
                      if (podium.includes(group)) style = { '--fill': 'var(--color-sun)', boxShadow: PODIUM_FRAME };
                      return (
                        <li key={group} className="pixel-box flex min-h-0 flex-col" style={style}>
                          <div className="relative min-h-0 flex-1 bg-ink">
                            {photo && (
                              <img
                                src={photo}
                                alt={`Ảnh nhóm ${group + 1} lúc giơ bảng`}
                                className="absolute inset-0 size-full object-cover"
                              />
                            )}
                            <span className="absolute left-0 top-0 grid size-[8vh] place-items-center bg-ink font-pixel text-[6.5vh] font-bold leading-none text-paper">
                              {rank + 1}
                            </span>
                          </div>
                          <p className="pt-[0.8vh] text-center font-pixel text-[6vh] font-bold leading-none text-text">
                            Nhóm {group + 1}
                          </p>
                          <p className="py-[0.8vh] text-center text-[2.8vh] font-semibold leading-none text-text">
                            {LETTERS[lock.answer]} · {seconds} giây
                          </p>
                        </li>
                      );
                    })}
                    {GROUPS.filter((group) => !game.locked.has(group)).map((group) => (
                      <li key={group} className="pixel-box grid min-h-0 place-items-center text-center opacity-45">
                        <div>
                          <p className="font-pixel text-[6vh] font-bold leading-none text-text">Nhóm {group + 1}</p>
                          <p className="pt-[0.8vh] text-[2.8vh] font-semibold leading-none text-text">Chưa giơ bảng</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            <ul
              className="grid h-[13vh] shrink-0 gap-[0.7vw] pr-[24.5vh]"
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
