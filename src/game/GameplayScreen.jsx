import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_MODES } from '../../data/config/game-config';
import { DinoAvatar } from '../skins/DinoAvatar';
import { PixelBar } from '../ui/PixelBar';
import { PixelSprite } from '../ui/PixelSprite';
import { Sheet } from '../ui/Sheet';
import { SoundSettings } from '../ui/SoundSettings';
import { padScore } from '../utils/format';
import { randomRange } from '../utils/random';
import { soundFX } from '../utils/sound';
import { CanvasRenderer } from './canvas-renderer';
import { MilestoneManager } from './milestone-manager';
import { DINO_COLS, DINO_ROWS, ICONS, PIXEL, getObstacleSize } from './pixel-art';
import { QuestionController } from './question-controller';

const VIEW_HEIGHT = 280;
const GROUND_Y = 232;
const DINO_X = 56;
const DINO_WIDTH = DINO_COLS * PIXEL;
const DINO_HEIGHT = DINO_ROWS * PIXEL;
const CLOUD_WIDTH = 48;
const LOW_TIME_SEC = 3;
// Khớp biến thể CSS `phone-landscape` trong index.css
const PHONE_LANDSCAPE_QUERY = '(orientation: landscape) and (max-height: 500px)';

const ANSWER_KEYS = {
  Digit1: 0,
  Numpad1: 0,
  KeyA: 0,
  Digit2: 1,
  Numpad2: 1,
  KeyB: 1,
  Digit3: 2,
  Numpad3: 2,
  KeyC: 2,
  Digit4: 3,
  Numpad4: 3,
  KeyD: 3,
};
const LETTERS = ['A', 'B', 'C', 'D'];
const LETTER_COLORS = [
  'var(--color-sky)',
  'var(--color-grape)',
  'var(--color-bubblegum)',
  'var(--color-tangerine)',
];
const TRAIL_COLORS = {
  DUST: '#9ca3af',
  SPARKS: '#f59e0b',
  SOLAR: '#facc15',
  MATRIX: '#2dd4bf',
  ICE: '#38bdf8',
  FLAME: '#fb923c',
  GALAXY: '#a855f7',
};
const ANSWER_STYLES = {
  idle: {},
  correct: { '--fill': 'var(--color-leaf-soft)', '--edge': 'var(--color-leaf)' },
  wrong: { '--fill': 'var(--color-berry-soft)', '--edge': 'var(--color-berry)' },
  dim: { opacity: 0.45 },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function AnswerButton({ index, text, state, disabled, onSelect }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(index)}
      style={ANSWER_STYLES[state]}
      className={`pixel-box flex min-h-12 w-full items-center gap-3 px-2.5 py-1.5 text-left ${
        state === 'wrong' ? 'animate-shake' : ''
      }`}
    >
      <span
        className="grid size-8 shrink-0 place-items-center font-pixel text-[22px] font-bold text-[#1f1f1f]"
        style={{ backgroundColor: LETTER_COLORS[index] }}
      >
        {LETTERS[index]}
      </span>
      <span className="flex-1 text-[16px] font-medium leading-snug text-text">{text}</span>
      {state === 'correct' && (
        <PixelSprite rows={ICONS.check} size={18} color="var(--color-leaf-deep)" label="Đáp án đúng" />
      )}
      {state === 'wrong' && (
        <PixelSprite rows={ICONS.close} size={18} color="var(--color-berry-deep)" label="Đã chọn sai" />
      )}
    </button>
  );
}

function QuestionCard({ header, question, selectedOption, onSelect }) {
  const answered = selectedOption !== null;

  return (
    <div>
      {header}
      <p className="mt-3 text-[18px] font-semibold leading-snug text-text short:text-[17px]">
        {question.q}
      </p>
      <div className="mt-4 grid gap-[10px] short:grid-cols-2">
        {question.a.map((option, idx) => {
          let state = 'idle';
          if (answered) {
            if (idx === question.c) state = 'correct';
            else if (idx === selectedOption) state = 'wrong';
            else state = 'dim';
          }
          return (
            <AnswerButton
              key={`${idx}-${option}`}
              index={idx}
              text={option}
              state={state}
              disabled={answered}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Luật chơi: chạm để nhảy bất kỳ lúc nào; mỗi lần nhảy dừng game để hỏi 1 câu.
 * Đúng +1 điểm, sai không được điểm; trả lời xong khủng long vẫn nhảy và chạy tiếp.
 * Chỉ thua khi đâm vào chướng ngại vật. Điểm của lượt = số câu trả lời đúng.
 */
export const GameplayScreen = ({
  modeId,
  skin,
  highScore,
  autoStart = false,
  onGameOver,
  onExitToMenu,
}) => {
  const modeConfig = GAME_MODES[modeId];
  const timeLimit = modeConfig.questionTimeLimitSec;
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const timerFillRef = useRef(null);
  const timerLabelRef = useRef(null);

  // React UI state synced from game engine
  const [subState, setSubState] = useState(autoStart ? 'RUNNING' : 'READY');
  const [displayScore, setDisplayScore] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [milestoneSession, setMilestoneSession] = useState(null);
  const [floater, setFloater] = useState(null);
  const [milestoneProgressToast, setMilestoneProgressToast] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 280, cssH: 200 });

  useEffect(() => {
    if (soundFX.isBgmEnabled()) {
      soundFX.startBgm();
    }
  }, []);

  // Mutable engine refs to avoid multiple RAF loops or stale closures
  const subStateRef = useRef(autoStart ? 'RUNNING' : 'READY');
  const correctAnswersRef = useRef(0);
  const totalQuestionsRef = useRef(0);
  const speedRef = useRef(modeConfig.baseSpeed);
  const survivalSecondsRef = useRef(0);
  const passedMilestonesInRunRef = useRef([]);
  const gameEndedRef = useRef(false);
  const viewRef = useRef({ width: 900, scale: 1 });

  const dinoYRef = useRef(GROUND_Y - DINO_HEIGHT);
  const dinoVyRef = useRef(0);
  const isJumpingRef = useRef(false);
  const isCollidedRef = useRef(false);
  const legPhaseRef = useRef(0);
  const groundOffsetRef = useRef(0);

  const obstaclesRef = useRef([]);
  const nextObstacleDistanceRef = useRef(360);
  const cloudsRef = useRef([
    { x: 140, y: 42, speedFactor: 0.18 },
    { x: 420, y: 76, speedFactor: 0.14 },
    { x: 720, y: 30, speedFactor: 0.22 },
  ]);
  const particlesRef = useRef([]);

  const questionControllerRef = useRef(new QuestionController());
  const milestoneManagerRef = useRef(new MilestoneManager());
  const questionRef = useRef(null);
  const timeRemainingRef = useRef(timeLimit);
  // Cú nhảy đang chờ thực hiện khi thử thách cột mốc chen vào giữa
  const pendingJumpRef = useRef(false);
  const milestoneRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const crashTimerRef = useRef(null);
  const progressToastTimerRef = useRef(null);
  const milestoneTimerRef = useRef(null);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const updateMilestoneSession = useCallback((next) => {
    milestoneRef.current = next;
    setMilestoneSession(next);
  }, []);

  // Canvas co giãn theo vùng hiển thị thực của trình duyệt (trừ thanh công cụ), chừa đủ chỗ cho thẻ câu hỏi.
  // Màn thấp (khớp biến thể CSS `short`) xếp đáp án 2 cột nên cần ít chỗ hơn. Chiều cao logic luôn là VIEW_HEIGHT.
  useEffect(() => {
    const stage = stageRef.current;
    const measure = () => {
      const cssW = stage.clientWidth;
      const reserved = window.innerHeight <= 740 ? 350 : 470;
      const targetH = clamp(window.innerHeight - reserved, 150, 250);
      const viewW = Math.round(clamp((VIEW_HEIGHT * cssW) / targetH, 420, 900));
      const cssH = Math.round((cssW * VIEW_HEIGHT) / viewW);
      // Pixel art không cần độ phân giải 3x; giới hạn 2x để giảm tải GPU trên điện thoại
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(cssW * dpr);
      viewRef.current = { width: viewW, scale: w / viewW };
      setCanvasSize({ w, h: Math.round(cssH * dpr), cssH });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const triggerApproachingToastIfAny = useCallback((currentScoreVal) => {
    const approaching =
      milestoneManagerRef.current.checkApproachingMilestoneToast(
        currentScoreVal
      );
    if (approaching) {
      setMilestoneProgressToast(approaching);
      if (progressToastTimerRef.current !== null) {
        window.clearTimeout(progressToastTimerRef.current);
      }
      progressToastTimerRef.current = window.setTimeout(() => {
        setMilestoneProgressToast(null);
      }, 2600);
    }
  }, []);

  const updateSubState = useCallback((next) => {
    subStateRef.current = next;
    setSubState(next);
  }, []);

  const clearTimers = useCallback(() => {
    for (const timerRef of [
      feedbackTimerRef,
      crashTimerRef,
      progressToastTimerRef,
      milestoneTimerRef,
    ]) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  const finishGameRun = useCallback(() => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    clearTimers();
    onGameOverRef.current({
      mode: modeId,
      finalScore: correctAnswersRef.current,
      correctAnswers: correctAnswersRef.current,
      totalQuestions: totalQuestionsRef.current,
      milestonesPassedInRun: [...passedMilestonesInRunRef.current],
      survivalSeconds: Math.floor(survivalSecondsRef.current),
    });
  }, [clearTimers, modeId]);

  const addCorrectAnswer = useCallback(() => {
    correctAnswersRef.current += 1;
    setDisplayScore(correctAnswersRef.current);
  }, []);

  const performJump = useCallback(() => {
    isJumpingRef.current = true;
    dinoVyRef.current = modeConfig.jumpVelocity;
    soundFX.playJump();
  }, [modeConfig.jumpVelocity]);

  const startRun = useCallback(() => {
    if (subStateRef.current !== 'READY') return;
    soundFX.playClick();
    updateSubState('RUNNING');
  }, [updateSubState]);

  /**
   * Người chơi muốn nhảy: dừng game và hiện câu hỏi; cú nhảy chỉ diễn ra sau khi trả lời.
   */
  const requestJump = useCallback(() => {
    if (subStateRef.current !== 'RUNNING' || isJumpingRef.current) return;

    const qInstance = questionControllerRef.current.getNextGameplayQuestion();
    if (!qInstance) {
      // Ngân hàng câu hỏi trống thì nhảy ngay
      performJump();
      return;
    }

    const newQuestion = { question: qInstance.question, selectedOption: null };
    questionRef.current = newQuestion;
    timeRemainingRef.current = timeLimit;
    setActiveQuestion(newQuestion);
    updateSubState('QUESTION_ACTIVE');
  }, [performJump, timeLimit, updateSubState]);

  /**
   * Kiểm tra xem số câu đúng hiện tại có mở thử thách cột mốc (10, 30, 60, 100+) hay không.
   */
  const checkAndOpenMilestoneIfAny = useCallback(() => {
    if (gameEndedRef.current) return false;
    const pending = milestoneManagerRef.current.checkPendingMilestone(
      correctAnswersRef.current
    );
    if (!pending) return false;

    updateMilestoneSession({
      instance: pending,
      currentIndex: 0,
      correctCount: 0,
      selectedOption: null,
      lastAnswerCorrect: null,
      passed: false,
    });
    updateSubState('MILESTONE_INTRO');
    return true;
  }, [updateMilestoneSession, updateSubState]);

  // Quay lại đường chạy: mở thử thách nếu vừa chạm mốc, nếu không thì thực hiện cú nhảy đang chờ
  const continueRun = useCallback(() => {
    if (checkAndOpenMilestoneIfAny()) return;
    updateSubState('RUNNING');
    if (pendingJumpRef.current) {
      pendingJumpRef.current = false;
      performJump();
    }
    triggerApproachingToastIfAny(correctAnswersRef.current);
  }, [checkAndOpenMilestoneIfAny, performJump, triggerApproachingToastIfAny, updateSubState]);

  /**
   * Trả lời câu hỏi khi nhảy (optionIndex = -1 khi hết giờ). Đúng hay sai đều nhảy tiếp.
   */
  const handleJumpAnswer = useCallback(
    (optionIndex) => {
      if (subStateRef.current !== 'QUESTION_ACTIVE') return;
      const currentQ = questionRef.current;
      if (!currentQ || currentQ.selectedOption !== null) return;

      const isCorrect = optionIndex === currentQ.question.c;
      totalQuestionsRef.current += 1;
      if (isCorrect) {
        addCorrectAnswer();
        setFloater({ id: Date.now(), text: '+1' });
        soundFX.playCorrect();
      } else {
        soundFX.playWrong();
      }

      const answered = { ...currentQ, selectedOption: optionIndex };
      questionRef.current = answered;
      setActiveQuestion(answered);
      updateSubState('QUESTION_FEEDBACK');

      // Câu sai giữ lâu hơn để người chơi kịp xem đáp án đúng
      feedbackTimerRef.current = window.setTimeout(
        () => {
          feedbackTimerRef.current = null;
          questionRef.current = null;
          setActiveQuestion(null);
          pendingJumpRef.current = true;
          continueRun();
        },
        isCorrect ? 500 : 1400
      );
    },
    [addCorrectAnswer, continueRun, updateSubState]
  );

  /**
   * Chuyển sang câu hỏi phụ tiếp theo hoặc tổng kết khi đã hết câu.
   */
  const handleNextMilestoneQuestion = useCallback(() => {
    const session = milestoneRef.current;
    if (!session || session.selectedOption === null) return;
    milestoneTimerRef.current = null;

    const nextIdx = session.currentIndex + 1;
    if (nextIdx < session.instance.questions.length) {
      updateMilestoneSession({
        ...session,
        currentIndex: nextIdx,
        selectedOption: null,
        lastAnswerCorrect: null,
      });
      return;
    }

    const passed = session.correctCount >= session.instance.requiredCorrectCount;
    if (passed) {
      passedMilestonesInRunRef.current.push(session.instance.config.id);
      soundFX.playMilestonePass();
    }
    updateMilestoneSession({ ...session, passed });
    updateSubState('MILESTONE_SUMMARY');
  }, [updateMilestoneSession, updateSubState]);

  /**
   * Trả lời câu hỏi phụ trong Thử thách Cột mốc; mỗi câu đúng cũng được +1 điểm.
   * Trả lời đúng tự chuyển câu; trả lời sai giữ lại để người chơi xem đáp án.
   */
  const handleMilestoneAnswer = useCallback(
    (optionIndex) => {
      const session = milestoneRef.current;
      if (!session || subStateRef.current !== 'MILESTONE_QUIZ') return;
      if (session.selectedOption !== null) return;

      const currentQ = session.instance.questions[session.currentIndex];
      if (!currentQ) return;

      const isCorrect = optionIndex === currentQ.c;
      totalQuestionsRef.current += 1;
      if (isCorrect) {
        addCorrectAnswer();
        soundFX.playCorrect();
      } else {
        soundFX.playWrong();
      }

      updateMilestoneSession({
        ...session,
        correctCount: session.correctCount + (isCorrect ? 1 : 0),
        selectedOption: optionIndex,
        lastAnswerCorrect: isCorrect,
      });

      if (isCorrect) {
        milestoneTimerRef.current = window.setTimeout(handleNextMilestoneQuestion, 700);
      }
    },
    [addCorrectAnswer, handleNextMilestoneQuestion, updateMilestoneSession]
  );

  const handleStartMilestoneQuiz = useCallback(() => {
    const session = milestoneRef.current;
    if (!session || subStateRef.current !== 'MILESTONE_INTRO') return;
    soundFX.playClick();
    if (session.instance.questions.length === 0) {
      updateMilestoneSession(null);
      continueRun();
    } else {
      updateSubState('MILESTONE_QUIZ');
    }
  }, [continueRun, updateMilestoneSession, updateSubState]);

  const handleResumeFromMilestone = useCallback(() => {
    if (subStateRef.current !== 'MILESTONE_SUMMARY') return;
    soundFX.playClick();
    updateMilestoneSession(null);
    // Câu đúng trong thử thách có thể đã chạm luôn mốc tiếp theo
    continueRun();
  }, [continueRun, updateMilestoneSession]);

  const pauseRun = useCallback(() => {
    if (subStateRef.current !== 'RUNNING') return;
    soundFX.playClick();
    updateSubState('PAUSED');
  }, [updateSubState]);

  const resumeRun = useCallback(() => {
    if (subStateRef.current !== 'PAUSED') return;
    updateSubState('RUNNING');
  }, [updateSubState]);

  // Phím tắt: Space/↑ để bắt đầu & nhảy, 1-4 / A-D để trả lời, Enter để tiếp tục, Esc/P để tạm dừng
  const keyHandlersRef = useRef(null);
  keyHandlersRef.current = {
    startRun,
    requestJump,
    pauseRun,
    handleJumpAnswer,
    handleMilestoneAnswer,
    handleNextMilestoneQuestion,
    handleStartMilestoneQuiz,
    handleResumeFromMilestone,
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const h = keyHandlersRef.current;
      const isJumpKey = e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW';
      const isPauseKey = e.code === 'Escape' || e.code === 'KeyP';
      const isNextKey = e.code === 'Enter' || e.code === 'Space';
      const answerIndex = ANSWER_KEYS[e.code];

      const actions = {
        READY: () => {
          if (isJumpKey) h.startRun();
        },
        RUNNING: () => {
          if (isJumpKey) h.requestJump();
          else if (isPauseKey) h.pauseRun();
        },
        QUESTION_ACTIVE: () => {
          if (answerIndex !== undefined) h.handleJumpAnswer(answerIndex);
        },
        MILESTONE_INTRO: () => {
          if (isNextKey) h.handleStartMilestoneQuiz();
        },
        MILESTONE_QUIZ: () => {
          if (answerIndex !== undefined) h.handleMilestoneAnswer(answerIndex);
          else if (isNextKey) h.handleNextMilestoneQuestion();
        },
        MILESTONE_SUMMARY: () => {
          if (isNextKey) h.handleResumeFromMilestone();
        },
      };

      const action = actions[subStateRef.current];
      if (!action) return;
      if (isJumpKey || isPauseKey || isNextKey || answerIndex !== undefined) {
        e.preventDefault();
      }
      action();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tự tạm dừng khi người chơi rời khỏi tab/ứng dụng hoặc xoay ngang điện thoại
  useEffect(() => {
    const landscape = window.matchMedia(PHONE_LANDSCAPE_QUERY);
    const pauseIfHidden = () => {
      const hidden = document.hidden || landscape.matches;
      if (hidden && subStateRef.current === 'RUNNING') {
        updateSubState('PAUSED');
      }
    };
    document.addEventListener('visibilitychange', pauseIfHidden);
    landscape.addEventListener('change', pauseIfHidden);
    return () => {
      document.removeEventListener('visibilitychange', pauseIfHidden);
      landscape.removeEventListener('change', pauseIfHidden);
    };
  }, [updateSubState]);

  // Main requestAnimationFrame loop with strict cleanup
  useEffect(() => {
    let animationFrameId = null;
    let lastTimestamp = performance.now();

    const spawnObstacle = () => {
      const allowed = modeConfig.allowedObstacleTypes;
      const chosenType = allowed[Math.floor(Math.random() * allowed.length)];
      const { width, height } = getObstacleSize(chosenType);

      obstaclesRef.current.push({
        type: chosenType,
        x: viewRef.current.width + 40,
        // Thằn lằn bay ở tầm trung nên vẫn phải nhảy qua
        y: chosenType === 'PTERODACTYL' ? GROUND_Y - 58 : GROUND_Y - height,
        width,
        height,
        wingPhase: 0,
      });
      nextObstacleDistanceRef.current = randomRange(
        modeConfig.obstacleMinGap,
        modeConfig.obstacleMaxGap
      );
    };

    const spawnTrailParticle = () => {
      if (skin.visual.trailStyle === 'NONE') return;
      if (Math.random() > 0.35) return;

      particlesRef.current.push({
        x: DINO_X + 6,
        y: dinoYRef.current + DINO_HEIGHT - 8,
        vx: -randomRange(60, 140),
        vy: -randomRange(10, 45),
        size: PIXEL,
        alpha: 0.85,
        color: TRAIL_COLORS[skin.visual.trailStyle] || '#9ca3af',
      });
    };

    // Cập nhật hạt bụi tại chỗ, không tạo mảng mới mỗi khung hình
    const updateParticles = (dt) => {
      const particles = particlesRef.current;
      let kept = 0;
      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= dt * 1.8;
        if (p.alpha > 0.02) particles[kept++] = p;
      }
      particles.length = kept;
    };

    const hitsObstacle = (obs) => {
      const pad = 8;
      return (
        DINO_X + DINO_WIDTH - pad > obs.x + pad &&
        DINO_X + pad < obs.x + obs.width - pad &&
        dinoYRef.current + DINO_HEIGHT - pad > obs.y + pad &&
        dinoYRef.current + pad < obs.y + obs.height - pad
      );
    };

    // Cập nhật thanh thời gian trực tiếp trên DOM để không render lại React mỗi khung hình
    const renderTimer = (timeLeft) => {
      const low = timeLeft <= LOW_TIME_SEC;
      if (timerFillRef.current) {
        timerFillRef.current.style.width = `${(timeLeft / timeLimit) * 100}%`;
        timerFillRef.current.style.backgroundColor = low ? 'var(--color-berry)' : 'var(--color-leaf)';
      }
      const label = timerLabelRef.current;
      const seconds = String(Math.ceil(timeLeft));
      if (label && label.textContent !== seconds) {
        label.textContent = seconds;
        label.style.color = low ? 'var(--color-berry-deep)' : '';
      }
    };

    const updateRunning = (dt) => {
      survivalSecondsRef.current += dt;
      speedRef.current = Math.min(
        modeConfig.maxSpeed,
        speedRef.current + modeConfig.speedAcceleration * dt
      );
      const speed = speedRef.current;
      groundOffsetRef.current += speed * dt;
      legPhaseRef.current += dt * (speed * 0.045);

      if (isJumpingRef.current) {
        dinoYRef.current += dinoVyRef.current * dt;
        dinoVyRef.current += modeConfig.gravity * dt;
        if (dinoYRef.current >= GROUND_Y - DINO_HEIGHT) {
          dinoYRef.current = GROUND_Y - DINO_HEIGHT;
          dinoVyRef.current = 0;
          isJumpingRef.current = false;
        }
      } else {
        spawnTrailParticle();
      }

      for (const cloud of cloudsRef.current) {
        cloud.x -= speed * cloud.speedFactor * dt;
        if (cloud.x + CLOUD_WIDTH < 0) {
          cloud.x = viewRef.current.width + randomRange(20, 100);
          cloud.y = randomRange(24, 90);
        }
      }

      updateParticles(dt);

      nextObstacleDistanceRef.current -= speed * dt;
      if (nextObstacleDistanceRef.current <= 0) {
        spawnObstacle();
      }

      for (const obs of obstaclesRef.current) {
        obs.x -= speed * dt;
        obs.wingPhase += dt * 10;
        if (hitsObstacle(obs)) {
          isCollidedRef.current = true;
          soundFX.playWrong();
          updateSubState('CRASHING');
          crashTimerRef.current = window.setTimeout(finishGameRun, 1100);
          return;
        }
      }

      obstaclesRef.current = obstaclesRef.current.filter((obs) => obs.x + obs.width > -40);
    };

    const step = (now) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.05); // Clamp delta time when tab switches
      lastTimestamp = now;
      const state = subStateRef.current;

      if (state === 'RUNNING' && !gameEndedRef.current) {
        updateRunning(dt);
      } else if (state === 'QUESTION_ACTIVE' && questionRef.current) {
        const timeLeft = timeRemainingRef.current - dt;
        if (timeLeft <= 0) {
          handleJumpAnswer(-1); // Hết giờ tính như trả lời sai
        } else {
          timeRemainingRef.current = timeLeft;
          renderTimer(timeLeft);
        }
      }

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        const { width: viewWidth, scale } = viewRef.current;
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.imageSmoothingEnabled = false;
        CanvasRenderer.drawScene(ctx, {
          width: viewWidth,
          height: VIEW_HEIGHT,
          groundY: GROUND_Y,
          groundOffset: groundOffsetRef.current,
          dinoX: DINO_X,
          dinoY: dinoYRef.current,
          dinoWidth: DINO_WIDTH,
          isJumping: isJumpingRef.current,
          isCollided: isCollidedRef.current,
          isIdle: state === 'READY',
          legPhase: legPhaseRef.current,
          skin,
          obstacles: obstaclesRef.current,
          clouds: cloudsRef.current,
          particles: particlesRef.current,
          thinking: state === 'QUESTION_ACTIVE' || state === 'QUESTION_FEEDBACK',
          night: state.startsWith('MILESTONE'),
          time: now,
        });
      }

      animationFrameId = window.requestAnimationFrame(step);
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      clearTimers();
    };
  }, [clearTimers, finishGameRun, handleJumpAnswer, modeConfig, skin, timeLimit, updateSubState]);

  // Chạm bất kỳ đâu (trừ nút bấm) để bắt đầu hoặc nhảy
  const handleScreenPointer = (e) => {
    if (e.target.closest('button, input, a')) return;
    if (subStateRef.current === 'READY') startRun();
    else requestJump();
  };

  const night = subState.startsWith('MILESTONE');
  const nextMilestone = MilestoneManager.getNextMilestoneProgress(displayScore);
  const timeLow = timeRemainingRef.current <= LOW_TIME_SEC;
  const milestoneQuestion =
    milestoneSession?.instance.questions[milestoneSession.currentIndex];

  return (
    <div
      className={`min-h-dvh touch-manipulation bg-paper text-text select-none [-webkit-touch-callout:none] ${
        night ? 'night' : ''
      }`}
      onPointerDown={handleScreenPointer}
    >
      <div className="fixed inset-0 z-[60] hidden place-items-center bg-paper p-8 text-center phone-landscape:grid">
        <div className="flex flex-col items-center">
          <DinoAvatar skin={skin} size={72} />
          <p className="mt-3 max-w-[18ch] font-pixel text-[34px] font-bold leading-tight text-ink">
            Xoay dọc điện thoại để chơi tiếp
          </p>
        </div>
      </div>

      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col pt-[env(safe-area-inset-top)] md:max-w-[720px]">
        {/* HUD: nút tạm dừng / quay lại và điểm (số câu đúng) kiểu arcade */}
        <header className="flex h-12 items-center justify-between px-2">
          {subState === 'READY' ? (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onExitToMenu();
              }}
              aria-label="Về trang chính"
              className="grid size-11 place-items-center text-ink"
            >
              <PixelSprite rows={ICONS.back} size={22} />
            </button>
          ) : (
            <button
              type="button"
              onClick={pauseRun}
              aria-label="Tạm dừng"
              className={`grid size-11 place-items-center text-ink ${
                subState === 'RUNNING' ? '' : 'invisible'
              }`}
            >
              <PixelSprite rows={ICONS.pause} size={22} />
            </button>
          )}
          <p className="pr-2 font-pixel text-[26px] font-bold tabular-nums tracking-wide">
            <span className="text-muted">HI {padScore(highScore)}</span>
            <span className="ml-3 text-ink">{padScore(displayScore)}</span>
          </p>
        </header>

        {/* Canvas Viewport Container */}
        <div ref={stageRef} className="relative">
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            style={{ height: canvasSize.cssH }}
            className="block w-full touch-manipulation"
          />

          {floater && (
            <span
              key={floater.id}
              className="pointer-events-none absolute font-pixel text-[28px] font-extrabold text-leaf-deep animate-float-up"
              style={{
                left: `${((DINO_X + DINO_WIDTH / 2) / viewRef.current.width) * 100}%`,
                top: `${((GROUND_Y - DINO_HEIGHT - 70) / VIEW_HEIGHT) * 100}%`,
              }}
            >
              {floater.text}
            </span>
          )}

          {milestoneProgressToast && subState === 'RUNNING' && (
            <p
              className="pixel-box pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap px-3 py-1 font-pixel text-[20px] font-bold text-[#2b2b2b] animate-pop"
              style={{ '--fill': 'var(--color-sun)' }}
            >
              Sắp tới mốc {milestoneProgressToast.nextThreshold} câu đúng!
            </p>
          )}

          {subState === 'CRASHING' && (
            <p className="pointer-events-none absolute inset-x-0 top-[22%] text-center font-pixel text-[40px] font-extrabold tracking-[0.3em] text-ink">
              GAME OVER
            </p>
          )}
        </div>

        {/* Bảng điều khiển phía dưới: hướng dẫn, câu hỏi hoặc thử thách cột mốc */}
        <div className="flex flex-1 flex-col px-4 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {subState === 'READY' && (
            <div className="pt-6 text-center">
              <p className="font-pixel text-[38px] font-bold text-ink animate-blink">
                Chạm để bắt đầu
              </p>
              <p className="mx-auto mt-3 max-w-[32ch] text-[15px] leading-relaxed text-muted">
                Chạm màn hình để nhảy. Mỗi lần nhảy là một câu hỏi: đúng được +1 điểm, sai vẫn chạy tiếp. Đâm vào chướng ngại vật là thua.
              </p>
              <p className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-text">
                <span className="font-pixel text-[22px] font-bold">{modeConfig.name}</span>
                {timeLimit} giây mỗi câu
              </p>
            </div>
          )}

          {(subState === 'RUNNING' || subState === 'PAUSED') && (
            <div className="pt-6">
              <p className="text-center font-pixel text-[26px] font-medium text-muted">
                Chạm để nhảy
              </p>
              <div className="mt-8">
                <div className="flex items-baseline justify-between text-[14px]">
                  <span className="text-muted">
                    Mốc tiếp theo: {nextMilestone.nextThreshold} câu đúng
                  </span>
                  <span className="font-semibold text-sun-deep">
                    còn {nextMilestone.pointsRemaining} câu
                  </span>
                </div>
                <PixelBar
                  value={nextMilestone.progressPercent / 100}
                  color="var(--color-sun)"
                  label="Tiến độ tới cột mốc tiếp theo"
                  className="mt-2 h-3"
                />
              </div>
            </div>
          )}

          {(subState === 'QUESTION_ACTIVE' || subState === 'QUESTION_FEEDBACK') &&
            activeQuestion && (
              <QuestionCard
                question={activeQuestion.question}
                selectedOption={activeQuestion.selectedOption}
                onSelect={handleJumpAnswer}
                header={
                  <div className="flex items-center gap-3">
                    <PixelBar
                      value={timeRemainingRef.current / timeLimit}
                      color={timeLow ? 'var(--color-berry)' : 'var(--color-leaf)'}
                      label="Thời gian còn lại"
                      className="h-3 flex-1"
                      fillRef={timerFillRef}
                    />
                    <span
                      ref={timerLabelRef}
                      className="w-7 text-right font-pixel text-[24px] font-bold tabular-nums text-ink"
                    >
                      {Math.ceil(timeRemainingRef.current)}
                    </span>
                  </div>
                }
              />
            )}

          {subState === 'MILESTONE_INTRO' && milestoneSession && (
            <div className="pixel-box mt-4 p-5 text-center">
              <p className="font-pixel text-[24px] font-bold text-sun">Thử thách cột mốc</p>
              <h2 className="mt-1 font-pixel text-[56px] font-extrabold leading-none text-text">
                {milestoneSession.instance.exactThresholdScore} câu đúng
              </h2>
              <p className="mx-auto mt-4 max-w-[32ch] text-[16px] leading-relaxed text-text">
                Trả lời đúng {milestoneSession.instance.requiredCorrectCount}/
                {milestoneSession.instance.questions.length} câu để vượt mốc. Mỗi câu đúng vẫn được{' '}
                <strong className="text-sun">+1 điểm</strong>.
              </p>
              {milestoneSession.instance.warningMessage && (
                <p className="mt-2 text-[13px] text-muted">
                  {milestoneSession.instance.warningMessage}
                </p>
              )}
              <button
                type="button"
                onClick={handleStartMilestoneQuiz}
                className="pixel-btn mt-6 w-full"
              >
                Bắt đầu
              </button>
            </div>
          )}

          {subState === 'MILESTONE_QUIZ' && milestoneSession && milestoneQuestion && (
            <>
              <QuestionCard
                question={milestoneQuestion}
                selectedOption={milestoneSession.selectedOption}
                onSelect={handleMilestoneAnswer}
                header={
                  <div>
                    <div className="flex items-baseline justify-between font-pixel text-[22px] font-bold">
                      <span className="text-text">
                        Câu {milestoneSession.currentIndex + 1}/
                        {milestoneSession.instance.questions.length}
                      </span>
                      {milestoneSession.correctCount >=
                      milestoneSession.instance.requiredCorrectCount ? (
                        <span className="text-leaf">Đạt rồi!</span>
                      ) : (
                        <span className="text-text">
                          Đúng {milestoneSession.correctCount}/
                          {milestoneSession.instance.requiredCorrectCount}
                        </span>
                      )}
                    </div>
                    <PixelBar
                      value={
                        milestoneSession.currentIndex /
                        milestoneSession.instance.questions.length
                      }
                      color="var(--color-sun)"
                      label="Tiến độ thử thách"
                      className="mt-2 h-2"
                    />
                  </div>
                }
              />
              {milestoneSession.lastAnswerCorrect === false && (
                <button
                  type="button"
                  onClick={handleNextMilestoneQuestion}
                  className="pixel-btn mt-5 w-full"
                >
                  {milestoneSession.currentIndex + 1 <
                  milestoneSession.instance.questions.length
                    ? 'Câu tiếp'
                    : 'Xem kết quả'}
                </button>
              )}
            </>
          )}

          {subState === 'MILESTONE_SUMMARY' && milestoneSession && (
            <div className="pixel-box mt-4 p-5 text-center">
              <p
                className={`font-pixel text-[24px] font-bold ${
                  milestoneSession.passed ? 'text-leaf' : 'text-muted'
                }`}
              >
                {milestoneSession.passed ? 'Vượt cột mốc!' : 'Chưa đạt lần này'}
              </p>
              <p className="mt-1 font-pixel text-[60px] font-extrabold leading-none text-text">
                {milestoneSession.correctCount}/{milestoneSession.instance.questions.length}
              </p>
              <p className="mx-auto mt-3 max-w-[32ch] text-[16px] leading-relaxed text-text">
                {milestoneSession.passed
                  ? 'Các câu đúng đã được cộng vào điểm của bạn.'
                  : `Cần ${milestoneSession.instance.requiredCorrectCount} câu đúng để vượt mốc. Các câu đúng vẫn được cộng điểm, cuộc đua tiếp tục!`}
              </p>
              <button
                type="button"
                onClick={handleResumeFromMilestone}
                className="pixel-btn mt-6 w-full"
              >
                Chạy tiếp
              </button>
            </div>
          )}
        </div>
      </div>

      <Sheet open={subState === 'PAUSED'} title="Tạm dừng" onClose={resumeRun}>
        <p className="text-[15px] text-muted">Số câu đúng</p>
        <p className="font-pixel text-[52px] font-extrabold leading-none tabular-nums text-ink">
          {padScore(displayScore)}
        </p>
        <div className="mt-6">
          <SoundSettings />
        </div>
        <div className="mt-7 grid gap-5">
          <button type="button" onClick={resumeRun} className="pixel-btn w-full">
            <PixelSprite rows={ICONS.play} size={20} />
            Tiếp tục
          </button>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              finishGameRun();
            }}
            className="pixel-btn pixel-btn-quiet w-full"
          >
            Kết thúc lượt
          </button>
        </div>
      </Sheet>
    </div>
  );
};
