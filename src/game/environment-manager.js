import { ENVIRONMENTS, ENVIRONMENT_SCHEDULE } from '../../data/config/game-config.js';
import { pickWeighted, randomRange } from '../utils/random.js';
import { PIXEL } from './pixel-art.js';

// Mép chuyển cảnh là lưới ô vuông TRANSITION_TILE; trong dải rộng TRANSITION_BAND các ô lật dần
export const TRANSITION_TILE = PIXEL * 4;
export const TRANSITION_BAND = TRANSITION_TILE * 8;

const SPECIAL_ENVIRONMENTS = Object.values(ENVIRONMENTS);
const TAU = Math.PI * 2;

// Nguồn hạt của từng môi trường: rate = số hạt mỗi giây.
// Sprite thiên thạch xiên 45° và sao băng dốc 1/4 nên vận tốc giữ đúng tỉ lệ đó.
const EMITTERS = {
  METEOR_SHOWER: [
    {
      kind: 'meteor',
      rate: 4,
      spawn: (w) => {
        const size = Math.random() < 0.6 ? 3 : 2;
        const v = randomRange(160, 230);
        return { x: randomRange(w * 0.1, w * 1.2), y: -9 * size, vx: -v, vy: v, life: 6, size };
      },
    },
  ],
  SHOOTING_STARS: [
    {
      kind: 'shooting',
      rate: 1.6,
      spawn: (w) => {
        const v = randomRange(120, 160);
        return { x: randomRange(w * 0.3, w * 1.05), y: randomRange(-10, 60), vx: -4 * v, vy: v, life: 3 };
      },
    },
  ],
  UNDERSEA: [
    {
      kind: 'bubble',
      rate: 5,
      spawn: (w, groundY) => {
        const size = Math.random() < 0.4 ? 3 : 2;
        const v = randomRange(28, 60);
        return {
          x: randomRange(0, w),
          y: groundY - 4 * size,
          vx: 0,
          vy: -v,
          // Vỡ trước khi chạm mặt nước
          life: (groundY - 50) / v,
          size,
          phase: Math.random() * TAU,
        };
      },
    },
    {
      kind: 'fish',
      rate: 0.4,
      spawn: (w) => ({
        x: w + 30,
        y: randomRange(40, 160),
        vx: -randomRange(35, 75),
        vy: 0,
        life: 40,
        phase: Math.random() * TAU,
      }),
    },
  ],
  SAKURA: [
    {
      kind: 'petal',
      rate: 8,
      spawn: (w) => ({
        x: randomRange(0, w * 1.3),
        y: -8,
        vx: -randomRange(40, 90),
        vy: randomRange(28, 52),
        life: 14,
        phase: Math.random() * TAU,
        flip: Math.random() < 0.5 ? 1 : 0,
      }),
    },
  ],
};

/**
 * Lên lịch môi trường nền: phần lớn thời gian là nền thường, thỉnh thoảng chuyển sang
 * một môi trường đặc biệt (theo trọng số) rồi quay về. Môi trường mới tràn vào từ mép phải.
 */
export class EnvironmentManager {
  constructor() {
    this.current = 'NORMAL';
    this.next = null;
    // Mép trái của dải chuyển cảnh trên màn hình
    this.boundaryX = 0;
    this.timeLeft = randomRange(...ENVIRONMENT_SCHEDULE.normalDurationSec);
    this.particles = [];
  }

  scheduleNext(width) {
    const { normalDurationSec, specialChance } = ENVIRONMENT_SCHEDULE;
    let special = null;
    if (this.current !== 'NORMAL') {
      this.next = 'NORMAL';
      this.timeLeft = randomRange(...normalDurationSec);
    } else if (Math.random() < specialChance) {
      special = pickWeighted(SPECIAL_ENVIRONMENTS);
      this.next = special.id;
      this.timeLeft = randomRange(...special.durationSec);
    } else {
      this.timeLeft = randomRange(...normalDurationSec);
    }
    this.boundaryX = width;
    return special;
  }

  /**
   * Chạy theo thời gian chạy thực của lượt chơi.
   * Trả về cấu hình môi trường đặc biệt vừa bắt đầu (để hiện thông báo), nếu có.
   */
  update(dt, speed, width, groundY) {
    let started = null;
    if (this.next) {
      // Môi trường mới gắn với mặt đất nên trôi vào cùng tốc độ chạy
      this.boundaryX -= speed * dt;
      if (this.boundaryX + TRANSITION_BAND <= 0) {
        this.current = this.next;
        this.next = null;
      }
    } else {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) started = this.scheduleNext(width);
    }

    // Trong lúc chuyển cảnh cả hai môi trường cùng sinh hạt, mỗi bên chỉ hiện trong vùng của mình
    for (const id of [this.current, this.next]) {
      for (const emitter of EMITTERS[id] ?? []) {
        if (Math.random() < emitter.rate * dt) {
          this.particles.push({ env: id, kind: emitter.kind, ...emitter.spawn(width, groundY) });
        }
      }
    }

    // Cập nhật tại chỗ; hạt của môi trường đã rời màn hình sẽ bị bỏ
    const particles = this.particles;
    let kept = 0;
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      const active = p.env === this.current || p.env === this.next;
      if (active && p.life > 0 && p.x > -60 && p.y > -30 && p.y < groundY) {
        particles[kept++] = p;
      }
    }
    particles.length = kept;
    return started;
  }
}
