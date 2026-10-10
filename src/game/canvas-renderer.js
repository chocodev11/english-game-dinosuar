import {
  BUBBLE_SPRITE,
  CLOUD_SPRITE,
  DINO_FRAME,
  MOON_SPRITE,
  OBSTACLE_SPRITES,
  PIXEL,
  PTERO_FRAMES,
  STAR_SPRITE,
  getDinoCells,
  spriteCells,
} from './pixel-art.js';

const DAY = {
  sky: '#f7f7f7',
  ink: '#535353',
  cloud: '#d6d6d6',
  speck: '#8f8f8f',
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

function drawMono(ctx, name, rows, color, x, y) {
  ctx.drawImage(
    monoSprite(name, rows, color),
    Math.round(x),
    Math.round(y),
    rows[0].length * PIXEL,
    rows.length * PIXEL
  );
}

/**
 * Vẽ toàn bộ khung cảnh pixel: nền, mây, mặt đất, chướng ngại vật và Khủng Long theo Skin.
 */
export class CanvasRenderer {
  static drawScene(ctx, params) {
    const {
      width,
      height,
      groundY,
      groundOffset,
      dinoX,
      dinoY,
      dinoWidth,
      isJumping,
      isCollided,
      isIdle,
      legPhase,
      skin,
      obstacles,
      clouds,
      particles,
      thinking,
      night,
      time,
    } = params;
    const pal = night ? NIGHT : DAY;

    ctx.fillStyle = pal.sky;
    ctx.fillRect(0, 0, width, height);

    if (night) {
      this.drawNightSky(ctx, width, pal);
    }

    for (const cloud of clouds) {
      drawMono(ctx, 'cloud', CLOUD_SPRITE, pal.cloud, cloud.x, cloud.y);
    }

    this.drawGround(ctx, width, groundY, groundOffset, pal);

    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;

    for (const obs of obstacles) {
      const rows =
        obs.type === 'PTERODACTYL'
          ? PTERO_FRAMES[Math.sin(obs.wingPhase) > 0 ? 0 : 1]
          : OBSTACLE_SPRITES[obs.type];
      drawMono(ctx, obs.type, rows, pal.ink, obs.x, obs.y);
    }

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

    if (thinking) {
      // Đặt trên khung sprite để không che mũ/phụ kiện của skin
      this.drawQuestionBubble(ctx, dinoX + dinoWidth / 2, dinoY + DINO_FRAME.y * PIXEL, time);
    }
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
