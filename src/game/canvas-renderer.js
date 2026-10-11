import { POWER_UPS } from '../../data/config/game-config.js';
import { TRANSITION_BAND, TRANSITION_TILE } from './environment-manager.js';
import {
  BUBBLE_SPRITE,
  CLOUD_SPRITE,
  DINO_FRAME,
  FISH_SPRITE,
  METEOR_SPRITE,
  MOON_SPRITE,
  OBSTACLE_SPRITES,
  PETAL_FRAMES,
  PIXEL,
  POWER_UP_BLOCK_SIZE,
  POWER_UP_ICONS,
  PTERO_FRAMES,
  RAINBOW_COLORS,
  SEA_BUBBLE_SPRITE,
  SHIELD_RING_RADIUS,
  SHOOTING_STAR_SPRITE,
  STAR_SPRITE,
  WAVE_SPRITE,
  getDinoCells,
  getPowerUpBlockCells,
  getShieldRingCells,
  spriteCells,
} from './pixel-art.js';

// Mọi môi trường giữ phong cách doodle của nền thường: nền phẳng, nét pixel một màu mực;
// decor là màu nhạt cho chi tiết nền, fx là màu nhấn duy nhất cho hiệu ứng đặc trưng
const ENV_PALETTES = {
  NORMAL: {
    sky: '#f7f7f7',
    ink: '#535353',
    cloud: '#d6d6d6',
    speck: '#8f8f8f',
  },
  METEOR_SHOWER: {
    sky: '#26201f',
    ink: '#e8d8c6',
    cloud: '#463c38',
    speck: '#8f7f72',
    decor: '#6b5d55',
    fx: '#f2c48d',
  },
  SHOOTING_STARS: {
    sky: '#1c2130',
    ink: '#d5dbea',
    cloud: '#343b50',
    speck: '#7a8399',
    decor: '#8e97ad',
    fx: '#f5f7ff',
    moon: '#fde68a',
  },
  // Dưới nước không có mây
  UNDERSEA: {
    sky: '#e7f1f3',
    ink: '#3e5b65',
    cloud: null,
    speck: '#8fb0b8',
    decor: '#b3cdd2',
    fx: '#6f9aa5',
  },
  SAKURA: {
    sky: '#faf1f2',
    ink: '#5a4a4f',
    cloud: '#e8d6da',
    speck: '#a8959a',
    decor: '#e8d6da',
    fx: '#ea9ab4',
  },
};

// Chế độ đêm dùng khi mở Thử thách Cột mốc
const NIGHT = {
  sky: '#202124',
  ink: '#c4c7cc',
  cloud: '#3c4043',
  speck: '#6b6f74',
  star: '#e8eaed',
  moon: '#fde68a',
};

const BUBBLE_FILL = '#ffcc1a';
const BUBBLE_INK = '#2b2b2b';

// Vết sỏi & gờ đất lặp lại mỗi 600 đơn vị: [x, y, rộng]
const GROUND_LOOP = 600;
const GROUND_SPECKS = [
  [12, 9, 6],
  [61, 15, 3],
  [104, 10, 3],
  [150, 19, 6],
  [205, 9, 3],
  [251, 14, 3],
  [298, 21, 6],
  [344, 9, 3],
  [392, 16, 6],
  [447, 11, 3],
  [493, 20, 3],
  [541, 10, 6],
];
const GROUND_BUMPS = [
  [86, 9],
  [318, 6],
  [472, 12],
];

const STARS = [
  [0.12, 34],
  [0.31, 70],
  [0.47, 28],
  [0.66, 58],
  [0.9, 92],
];

// Sao nền của môi trường đêm: [tỉ lệ x, y]
const STAR_FIELD = Array.from({ length: 28 }, (_, i) => [(i * 0.618034) % 1, 8 + ((i * 47) % 150)]);

// Rong biển cuộn chậm hơn mặt đất: [x trong vòng lặp, số ô chiều cao]
const SEAWEED_LOOP = 480;
const SEAWEEDS = [
  [30, 14],
  [42, 9],
  [140, 11],
  [215, 16],
  [227, 10],
  [330, 12],
  [420, 13],
];
const PETAL_NAMES = ['petal0', 'petal1'];

const HUD_FONT = '700 14px Handjet, sans-serif';

const spriteCache = new Map();

// Vẽ sprite một lần vào canvas phụ (1 ô = 1px) rồi tái sử dụng bằng drawImage
function getSprite(key, build) {
  let canvas = spriteCache.get(key);
  if (!canvas) {
    const { cells, w, h, ox = 0, oy = 0 } = build();
    canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const c = canvas.getContext('2d');
    for (const cell of cells) {
      c.fillStyle = cell.color;
      c.fillRect(cell.x - ox, cell.y - oy, 1, 1);
    }
    spriteCache.set(key, canvas);
  }
  return canvas;
}

function monoSprite(name, rows, color) {
  return getSprite(`${name}:${color}`, () => ({
    cells: spriteCells(rows, color),
    w: rows[0].length,
    h: rows.length,
  }));
}

function drawMono(ctx, name, rows, color, x, y, cell = PIXEL) {
  ctx.drawImage(
    monoSprite(name, rows, color),
    Math.round(x),
    Math.round(y),
    rows[0].length * cell,
    rows.length * cell
  );
}

// Ngưỡng giả ngẫu nhiên cố định của từng ô, quyết định thứ tự ô lật sang môi trường mới
function tileNoise(c, r) {
  let h = Math.imul(c, 0x27d4eb2d) ^ Math.imul(r + 0x9e37, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  return ((h ^ (h >>> 12)) >>> 0) / 4294967296;
}

/**
 * Vẽ toàn bộ khung cảnh pixel: nền theo môi trường, mây, mặt đất, chướng ngại vật,
 * khối năng lượng và Khủng Long theo Skin.
 */
export class CanvasRenderer {
  static drawScene(ctx, params) {
    const {
      width,
      height,
      dinoX,
      dinoY,
      dinoWidth,
      isJumping,
      isCollided,
      isIdle,
      legPhase,
      skin,
      particles,
      environment: env,
      powerUps,
      effects,
      thinking,
      night,
      time,
    } = params;

    if (night) {
      this.drawWorld(ctx, params, NIGHT, null);
    } else {
      this.drawWorld(ctx, params, ENV_PALETTES[env.current], env.current);
      if (env.next) {
        // Môi trường mới tràn vào từ mép phải, mép chuyển cảnh lật dần từng ô pixel
        ctx.save();
        ctx.beginPath();
        this.traceTransition(ctx, env.boundaryX, width, height);
        ctx.clip();
        this.drawWorld(ctx, params, ENV_PALETTES[env.next], env.next);
        ctx.restore();
      }
    }

    for (const block of powerUps) {
      this.drawPowerUpBlock(ctx, block, time);
    }

    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;

    let pose = Math.sin(legPhase) > 0 ? 'run1' : 'run2';
    if (isCollided) pose = 'crash';
    else if (isIdle || isJumping) pose = 'stand';

    const dino = getSprite(`dino:${skin.id}:${pose}`, () => ({
      cells: getDinoCells(skin.visual, pose),
      w: DINO_FRAME.w,
      h: DINO_FRAME.h,
      ox: DINO_FRAME.x,
      oy: DINO_FRAME.y,
    }));
    ctx.drawImage(
      dino,
      Math.round(dinoX + DINO_FRAME.x * PIXEL),
      Math.round(dinoY + DINO_FRAME.y * PIXEL),
      DINO_FRAME.w * PIXEL,
      DINO_FRAME.h * PIXEL
    );

    this.drawDinoEffect(ctx, effects, dinoX, dinoY, time);

    if (thinking) {
      // Đặt trên khung sprite để không che mũ/phụ kiện của skin
      this.drawQuestionBubble(ctx, dinoX + dinoWidth / 2, dinoY + DINO_FRAME.y * PIXEL, time);
    }
  }

  // Lớp cảnh tô theo bảng màu của một môi trường: nền, mây, hiệu ứng, mặt đất, chướng ngại vật và HUD
  static drawWorld(ctx, params, pal, envId) {
    const { width, height, groundY, groundOffset, obstacles, clouds, environment, effects, night, time } =
      params;

    ctx.fillStyle = pal.sky;
    ctx.fillRect(0, 0, width, height);

    if (night) {
      this.drawNightSky(ctx, width, pal);
    } else {
      this.drawBackdrop(ctx, envId, pal, width, groundY, groundOffset, time);
    }

    if (pal.cloud) {
      for (const cloud of clouds) {
        drawMono(ctx, 'cloud', CLOUD_SPRITE, pal.cloud, cloud.x, cloud.y);
      }
    }

    if (!night) {
      this.drawEnvironmentParticles(ctx, environment.particles, envId, pal, width, groundY, time);
    }

    this.drawGround(ctx, width, groundY, groundOffset, pal);

    for (const obs of obstacles) {
      const rows =
        obs.type === 'PTERODACTYL'
          ? PTERO_FRAMES[Math.sin(obs.wingPhase) > 0 ? 0 : 1]
          : OBSTACLE_SPRITES[obs.type];
      drawMono(ctx, obs.type, rows, pal.ink, obs.x, obs.y);
    }

    this.drawEffectsHud(ctx, effects, pal);
  }

  // Vùng của môi trường mới: kín hẳn bên phải dải chuyển cảnh, lấm tấm từng ô bên trong dải
  static traceTransition(ctx, boundaryX, width, height) {
    const tile = TRANSITION_TILE;
    const first = Math.max(0, Math.floor(boundaryX / tile));
    const last = Math.floor((boundaryX + TRANSITION_BAND) / tile);
    const solidX = (last + 1) * tile;
    if (solidX < width) {
      ctx.rect(solidX, 0, width - solidX, height);
    }

    const rows = Math.ceil(height / tile);
    for (let c = first; c <= last && c * tile < width; c += 1) {
      // Càng về bên phải dải càng nhiều ô đã lật
      const progress = ((c + 0.5) * tile - boundaryX) / TRANSITION_BAND;
      for (let r = 0; r < rows; r += 1) {
        if (progress > tileNoise(c, r)) ctx.rect(c * tile, r * tile, tile, tile);
      }
    }
  }

  static drawBackdrop(ctx, envId, pal, width, groundY, groundOffset, time) {
    if (envId === 'METEOR_SHOWER') {
      this.drawStarField(ctx, width, pal, time, false);
    } else if (envId === 'SHOOTING_STARS') {
      this.drawStarField(ctx, width, pal, time, true);
      drawMono(ctx, 'moon', MOON_SPRITE, pal.moon, width - 72, 26);
    } else if (envId === 'UNDERSEA') {
      this.drawSeaBackdrop(ctx, pal, width, groundY, groundOffset, time);
    }
  }

  // twinkle: sao tắt/bật theo từng nhịp như game 8-bit
  static drawStarField(ctx, width, pal, time, twinkle) {
    const tick = Math.floor(time / 450);
    ctx.fillStyle = pal.decor;
    STAR_FIELD.forEach(([fx, y], i) => {
      if (twinkle && (tick + i) % 6 === 0) return;
      const x = Math.round(fx * width);
      if (twinkle && i % 4 === 0) {
        drawMono(ctx, 'star', STAR_SPRITE, pal.fx, x - 2, y - 2, 2);
      } else {
        ctx.fillRect(x, y, 2, 2);
      }
    });
  }

  static drawSeaBackdrop(ctx, pal, width, groundY, groundOffset, time) {
    // Mặt nước gợn sóng phía trên, cuộn chậm hơn mặt đất
    const waveWidth = WAVE_SPRITE[0].length * PIXEL;
    const waveShift = (groundOffset * 0.3) % waveWidth;
    for (let x = -waveShift; x < width; x += waveWidth) {
      drawMono(ctx, 'wave', WAVE_SPRITE, pal.decor, x, 12);
    }

    // Rong biển zigzag, gợn lắc truyền dần lên ngọn theo từng nhịp
    ctx.fillStyle = pal.decor;
    const frame = Math.floor(time / 300);
    const shift = (groundOffset * 0.45) % SEAWEED_LOOP;
    for (let base = -shift; base < width; base += SEAWEED_LOOP) {
      for (const [x, cells] of SEAWEEDS) {
        const left = Math.round(base + x);
        for (let j = 0; j < cells; j += 1) {
          const sway = ((j + frame) >> 1) & 1;
          ctx.fillRect(left + sway * PIXEL, groundY - (j + 1) * PIXEL, PIXEL, PIXEL);
        }
      }
    }
  }

  // Hạt hiệu ứng thuộc nền trời nên khuất sau đường chân trời; lắc lư theo từng nấc pixel
  static drawEnvironmentParticles(ctx, particles, envId, pal, width, groundY, time) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, groundY);
    ctx.clip();

    const tick = Math.floor(time / 250);
    for (const p of particles) {
      if (p.env !== envId) continue;
      switch (p.kind) {
        case 'meteor':
          drawMono(ctx, 'meteor', METEOR_SPRITE, pal.fx, p.x, p.y, p.size);
          break;
        case 'shooting':
          drawMono(ctx, 'shootingStar', SHOOTING_STAR_SPRITE, pal.fx, p.x, p.y, 2);
          break;
        case 'bubble': {
          const sway = Math.sin(time / 300 + p.phase) > 0 ? p.size : 0;
          drawMono(ctx, 'seaBubble', SEA_BUBBLE_SPRITE, pal.decor, p.x + sway, p.y, p.size);
          break;
        }
        case 'fish': {
          const bob = Math.sin(time / 400 + p.phase) > 0 ? 2 : 0;
          drawMono(ctx, 'fish', FISH_SPRITE, pal.fx, p.x, p.y + bob, 2);
          break;
        }
        case 'petal': {
          const frame = (tick + p.flip) % 2;
          const sway = Math.sin(time / 500 + p.phase) > 0 ? 4 : 0;
          drawMono(ctx, PETAL_NAMES[frame], PETAL_FRAMES[frame], pal.fx, p.x + sway, p.y, 2);
          break;
        }
        default:
          break;
      }
    }
    ctx.restore();
  }

  static drawPowerUpBlock(ctx, block, time) {
    const sprite = getSprite(`block:${block.type}`, () => ({
      cells: getPowerUpBlockCells(block.type, POWER_UPS[block.type].color),
      w: POWER_UP_BLOCK_SIZE,
      h: POWER_UP_BLOCK_SIZE,
    }));
    // Nhấp nhô lên xuống từng nấc pixel
    const bob = Math.sin(time / 220) > 0 ? 0 : PIXEL;
    ctx.drawImage(sprite, Math.round(block.x), Math.round(block.y - bob), block.width, block.height);
  }

  // Vòng khiên quanh khủng long; khi bất tử thì vòng đổi màu cầu vồng
  static drawDinoEffect(ctx, effects, dinoX, dinoY, time) {
    let color;
    if (effects.starLeft > 0) {
      // Sắp hết bất tử thì nhấp nháy để báo trước
      if (effects.starLeft < 1.5 && Math.floor(time / 110) % 2 === 0) return;
      color = RAINBOW_COLORS[Math.floor(time / 90) % RAINBOW_COLORS.length];
    } else if (effects.shield) {
      color = POWER_UPS.SHIELD.color;
    } else {
      return;
    }

    const r = SHIELD_RING_RADIUS;
    const size = r * 2 + 1;
    const ring = getSprite(`ring:${color}`, () => ({
      cells: getShieldRingCells(color),
      w: size,
      h: size,
      ox: 9 - r,
      oy: 9 - r,
    }));
    ctx.drawImage(
      ring,
      Math.round(dinoX + (9 - r) * PIXEL),
      Math.round(dinoY + (9 - r) * PIXEL),
      size * PIXEL,
      size * PIXEL
    );
  }

  // Hiệu ứng đang có ở góc trên trái, vẽ bằng màu mực như điểm số:
  // thanh thời gian còn lại hoặc số lượt dùng còn lại
  static drawEffectsHud(ctx, effects, pal) {
    let x = 8;
    const chip = (type, ratio = null, count = 0) => {
      // Khóa cache theo loại vì mọi icon cùng màu mực
      drawMono(ctx, `hud-${type}`, POWER_UP_ICONS[type], pal.ink, x, 10, 2);
      ctx.fillStyle = pal.ink;
      let w = 16;
      if (ratio !== null) {
        ctx.fillRect(x, 30, Math.ceil(16 * ratio), 2);
      }
      if (count > 0) {
        ctx.font = HUD_FONT;
        ctx.fillText(`x${count}`, x + 19, 25);
        w += 16;
      }
      x += w + 10;
    };

    if (effects.shield) chip('SHIELD');
    if (effects.starLeft > 0) chip('STAR', effects.starLeft / POWER_UPS.STAR.durationSec);
    if (effects.slowLeft > 0) chip('SLOW', effects.slowLeft / POWER_UPS.SLOW.durationSec);
    if (effects.hintCharges > 0) chip('HINT', null, effects.hintCharges);
    if (effects.timeCharges > 0) chip('TIME', null, effects.timeCharges);
  }

  static drawGround(ctx, width, groundY, groundOffset, pal) {
    ctx.fillStyle = pal.ink;
    ctx.fillRect(0, groundY, width, PIXEL);

    const shift = groundOffset % GROUND_LOOP;
    for (let base = -shift; base < width; base += GROUND_LOOP) {
      for (const [x, w] of GROUND_BUMPS) {
        ctx.fillRect(Math.round(base + x), groundY - PIXEL, w, PIXEL);
      }
    }

    ctx.fillStyle = pal.speck;
    for (let base = -shift; base < width; base += GROUND_LOOP) {
      for (const [x, y, w] of GROUND_SPECKS) {
        ctx.fillRect(Math.round(base + x), groundY + y, w, PIXEL);
      }
    }
  }

  static drawNightSky(ctx, width, pal) {
    for (const [fx, y] of STARS) {
      drawMono(ctx, 'star', STAR_SPRITE, pal.star, fx * width, y);
    }
    drawMono(ctx, 'moon', MOON_SPRITE, pal.moon, width - 72, 26);
  }

  // Bong bóng "?" nhấp nhô trên đầu khủng long khi đang trả lời câu hỏi
  static drawQuestionBubble(ctx, centerX, topY, time) {
    const w = BUBBLE_SPRITE[0].length * PIXEL;
    const h = BUBBLE_SPRITE.length * PIXEL;
    const bob = Math.sin(time / 170) > 0 ? 0 : PIXEL;
    const x = Math.round(centerX - w / 2);
    const y = Math.round(topY - h - 6 - bob);

    ctx.fillStyle = BUBBLE_FILL;
    ctx.fillRect(x + PIXEL, y + PIXEL, w - PIXEL * 2, h - PIXEL * 3);
    drawMono(ctx, 'bubble', BUBBLE_SPRITE, BUBBLE_INK, x, y);
  }
}
