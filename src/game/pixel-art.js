/**
 * Dữ liệu pixel-art dùng chung cho Canvas (gameplay) và SVG (avatar, icon).
 * Mỗi sprite là mảng chuỗi; ký tự '.' là ô trống, ký tự khác tra màu trong palette.
 */

// Số đơn vị logic của Canvas cho mỗi ô pixel
export const PIXEL = 3;

// Khung vuông chứa khủng long + phụ kiện (tính theo ô, gốc là góc trên trái thân; chân chạm đáy khung)
export const DINO_FRAME = { x: -5, y: -8, w: 27, h: 27 };

const DINO_BODY = [
  '.......ooooooooooo',
  '.......opppppppppo',
  '.......oppwepppppo',
  '.......oppwepppppo',
  '.......opppppppopo',
  '.......opppppppppo',
  '.......oppppoooooo',
  '.......opppppppo..',
  '...ooooopppppooo..',
  '..kopppppppppo....',
  '.kkoppppbbbbpooo..',
  '..koppppbbbbpo.o..',
  'ooooppppbbbbpo....',
  'ossspppppbbbpo....',
  '.ooopppppppppo....',
  '....oooooooooo....',
];

const DINO_LEGS = {
  stand: ['....osso.oppo.....', '....osso.oppo.....', '....oooo.ooooo....'],
  run1: ['....osso.oppo.....', '....oooo.oppo.....', '.........ooooo....'],
  run2: ['....osso.oppo.....', '....osso.oooo.....', '....oooo..........'],
};

// Thay thế vùng mắt (hàng 1-3) cho các tư thế đặc biệt
const EYE_ROWS = {
  blink: {
    2: '.......opppppppppo',
    3: '.......oppoopppppo',
  },
  crash: {
    1: '.......opepepppppo',
    2: '.......oppeppppppo',
    3: '.......opepepppppo',
  },
};

export const DINO_COLS = DINO_BODY[0].length;
export const DINO_ROWS = DINO_BODY.length + 3;

const ACCESSORIES = {
  HEADBAND: {
    x: 4,
    y: 1,
    palette: { r: '#dc2626', R: '#7f1d1d' },
    rows: ['..rRrrrrrrrrr', '.rr..........', 'r............'],
  },
  HEADPHONES: {
    x: 6,
    y: -2,
    palette: { K: '#0f172a', C: '#38bdf8' },
    rows: [
      '...KKKKKKK...',
      '..K.......K..',
      '.KCK.........',
      '.KCK.........',
      '.KCK.........',
      '.KKK.........',
    ],
  },
  SCHOLAR_HAT: {
    x: 6,
    y: -3,
    palette: { n: '#1e293b', N: '#475569', t: '#f59e0b' },
    rows: [
      '...nnnnnnn...',
      'nnnnnnnnnnnnn',
      '...NNNNNNN..t',
      '............t',
      '...........tt',
    ],
  },
  CROWN: {
    x: 9,
    y: -4,
    palette: { y: '#facc15', Y: '#a16207', r: '#dc2626' },
    rows: ['y..y..y', 'yy.y.yy', 'yyyryyy', 'YYYYYYY'],
  },
  HALO: {
    x: 9,
    y: -6,
    palette: { h: '#eab308' },
    rows: ['.hhhhh.', 'h.....h', '.hhhhh.'],
  },
  HORNS: {
    x: 8,
    y: -4,
    palette: { w: '#7dd3fc', W: '#0369a1' },
    rows: ['w....w..', 'ww...ww.', '.ww...ww', '.WW...WW'],
  },
  WIZARD_HAT: {
    x: 7,
    y: -8,
    palette: { i: '#4338ca', y: '#fde047', g: '#ca8a04' },
    rows: [
      '.......i....',
      '......ii....',
      '.....iii....',
      '.....iyii...',
      '....iiiii...',
      '...iiiiiii..',
      '..iiiiiiiii.',
      'gggggggggggg',
    ],
  },
  DRAGON_CREST: {
    x: 7,
    y: -3,
    palette: { f: '#ef4444', F: '#991b1b' },
    rows: ['.f...f...f.', '.ff.fff.ff.', 'FFFFFFFFFFF'],
  },
  ASTRONAUT_HELMET: {
    x: 5,
    y: -2,
    palette: { g: '#94a3b8', W: '#ffffff' },
    rows: [
      '...ggggggggg...',
      '.gg.........gg.',
      'g..W..........g',
      'g.W...........g',
      'g.............g',
      'g.............g',
      'g.............g',
      'g.............g',
      '.g...........g.',
      '..ggggggggggg..',
    ],
  },
  CYBER_VISOR: {
    x: 9,
    y: 1,
    palette: { K: '#0f172a', c: '#22d3ee' },
    rows: ['KKKKKKKK', 'cccccccc', 'KKKKKKKK'],
  },
};

// Vòng hào quang dạng pixel phía sau thân (cho skin có auraColor)
const AURA_CELLS = (() => {
  const cells = [];
  const cx = 9;
  const cy = 8.5;
  const r2 = 11.5 * 11.5;
  for (let y = -3; y <= 19; y += 1) {
    for (let x = -3; x <= 21; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) cells.push({ x, y });
    }
  }
  return cells;
})();

function pushRows(cells, rows, palette, offsetX, offsetY) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const color = palette[row[x]];
      if (color) cells.push({ x: x + offsetX, y: y + offsetY, color });
    }
  });
}

/**
 * Trả về danh sách ô màu của khủng long theo skin và tư thế.
 * pose: 'stand' | 'run1' | 'run2' | 'blink' | 'crash'
 */
export function getDinoCells(visual, pose = 'stand') {
  const palette = {
    o: visual.outlineColor,
    p: visual.primaryColor,
    s: visual.secondaryColor,
    b: visual.bellyColor,
    w: '#ffffff',
    e: visual.eyeColor,
    k: visual.spikeColor,
  };

  const eyeRows = EYE_ROWS[pose] || {};
  const body = DINO_BODY.map((row, y) => eyeRows[y] || row);
  const legs = DINO_LEGS[pose] || DINO_LEGS.stand;

  const cells = [];
  if (visual.auraColor) {
    AURA_CELLS.forEach((c) => cells.push({ ...c, color: visual.auraColor }));
  }
  pushRows(cells, [...body, ...legs], palette, 0, 0);

  const acc = ACCESSORIES[visual.accessory];
  if (acc) {
    pushRows(cells, acc.rows, acc.palette, acc.x, acc.y);
  }

  // Ô vẽ sau đè ô vẽ trước tại cùng vị trí (phụ kiện đè thân, thân đè hào quang)
  return Array.from(new Map(cells.map((c) => [`${c.x},${c.y}`, c])).values());
}

/** Gộp các ô cùng màu thành path SVG (mỗi đoạn ngang liền nhau là một hình chữ nhật). */
export function cellsToPaths(cells) {
  const sorted = [...cells].sort((a, b) => a.y - b.y || a.x - b.x);
  const paths = new Map();
  let run = null;
  const flush = () => {
    if (!run) return;
    const d = `M${run.x} ${run.y}h${run.len}v1h-${run.len}z`;
    paths.set(run.color, (paths.get(run.color) || '') + d);
  };

  for (const c of sorted) {
    if (run && run.color === c.color && run.y === c.y && run.x + run.len === c.x) {
      run.len += 1;
    } else {
      flush();
      run = { color: c.color, x: c.x, y: c.y, len: 1 };
    }
  }
  flush();
  return Array.from(paths, ([fill, d]) => ({ fill, d }));
}

/** Chuyển sprite một màu thành danh sách ô. */
export function spriteCells(rows, color) {
  const cells = [];
  pushRows(cells, rows, new Proxy({}, { get: (_, k) => (k === '.' ? undefined : color) }), 0, 0);
  return cells;
}

// --- Chướng ngại vật & khung cảnh (một màu, tô theo bảng màu ngày/đêm) ---

export const OBSTACLE_SPRITES = {
  CACTUS_SMALL: [
    '....ooo....',
    '...ooooo...',
    '...ooooo...',
    '.o.ooooo...',
    'oo.ooooo.o.',
    'oo.ooooo.oo',
    'oo.ooooo.oo',
    'oo.ooooo.oo',
    '.ooooooooo.',
    '...ooooo...',
    '...ooooo...',
    '...ooooo...',
    '...ooooo...',
    '...ooooo...',
    '...ooooo...',
  ],
  CACTUS_CLUSTER: [
    '.......ooo........',
    '......ooooo.......',
    '......ooooo.......',
    '..oo..ooooo.......',
    '.oooo.ooooo..oo...',
    '.oooo.ooooo.oooo..',
    '.oooo.ooooo.oooo.o',
    'ooooo.ooooo.oooooo',
    'ooooo.ooooo.oooo.o',
    '.oooooooooo.oooo..',
    '.oooo.ooooooooo...',
    '.oooo.ooooo.oooo..',
    '.oooo.ooooo.oooo..',
    '.oooo.ooooo.oooo..',
    '.oooo.ooooo.oooo..',
    '.oooo.ooooo.oooo..',
    '.oooo.ooooo.oooo..',
  ],
  ROCK_SPIKE: [
    '..........o....',
    '.........oo....',
    '.........ooo...',
    '...o....oooo...',
    '..ooo...ooooo..',
    '..oooo.oooooo..',
    '.ooooooooooooo.',
    '.ooooo.oooooooo',
    'oooooooooo.oooo',
    'ooo.ooooooooooo',
    'ooooooooooooooo',
    'ooooooo.ooooooo',
    'ooooooooooooooo',
  ],
};

export const PTERO_FRAMES = [
  [
    '.......o........',
    '.......oo.......',
    '.......ooo......',
    '.......oooo.....',
    '..oo...ooooo....',
    '.ooooooooooooo..',
    'ooo.ooooooooooo.',
    '....ooooooooo...',
    '................',
    '................',
  ],
  [
    '................',
    '................',
    '................',
    '................',
    '..oo............',
    '.ooooooooooooo..',
    'ooo.ooooooooooo.',
    '....ooooooooo...',
    '.......oooo.....',
    '........oo......',
  ],
];

export const CLOUD_SPRITE = [
  '......oooo......',
  '....oo....o.....',
  '...o.......oo...',
  '.ooo.........o..',
  'o.............o.',
  'oooooooooooooooo',
];

export const MOON_SPRITE = [
  '..ooo..',
  '.oo....',
  'ooo....',
  'ooo....',
  'ooo....',
  '.oo....',
  '..ooo..',
];

export const STAR_SPRITE = ['.o.', 'ooo', '.o.'];

export const BUBBLE_SPRITE = [
  '.ooooooooo.',
  'o.........o',
  'o...qqq...o',
  'o..q...q..o',
  'o......q..o',
  'o.....q...o',
  'o....q....o',
  'o.........o',
  'o....q....o',
  'o.........o',
  '.oooo.oooo.',
  '.....o.....',
];

// --- Môi trường đặc biệt (nét doodle một màu như mây) ---

// Đá rơi xiên xuống trái, ba vệt tốc độ kéo lên phải
export const METEOR_SPRITE = [
  '.....o..o..o',
  '....o..o..o.',
  '...o..o..o..',
  '.....o......',
  '....o..o....',
  '.oo...o.....',
  'oooo.o......',
  'oooo........',
  '.oo.........',
];

// Ngôi sao chữ thập kéo vệt mảnh, thưa dần về cuối
export const SHOOTING_STAR_SPRITE = [
  '...............o.o.',
  '..........ooo.o....',
  '.o....oooo.........',
  'oooooo.............',
  '.o.................',
];

// Một nhịp sóng mặt nước, ghép nối tiếp thành đường gợn liền
export const WAVE_SPRITE = ['...oooo.....', '.oo....oo...', 'o........ooo'];

export const FISH_SPRITE = [
  '..oooo....',
  '.o....o..o',
  'o.o....oo.',
  '.o....o..o',
  '..oooo....',
];

export const SEA_BUBBLE_SPRITE = ['.oo.', 'o..o', 'o..o', '.oo.'];

// Hai khung cánh hoa lật qua lại khi rơi
export const PETAL_FRAMES = [
  ['oo.', 'ooo', '.oo'],
  ['.oo', 'ooo', 'oo.'],
];

export const RAINBOW_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa'];

// --- Khối năng lượng (power-up) ---

export const POWER_UP_BLOCK_SIZE = 12;
const BLOCK_EDGE = '#2b2b2b';

// Biểu tượng 8x8 vẽ giữa khối năng lượng và trên HUD
export const POWER_UP_ICONS = {
  SHIELD: [
    'xxxxxxxx',
    'x.xxxxxx',
    'x.xxxxxx',
    'xxxxxxxx',
    '.xxxxxx.',
    '.xxxxxx.',
    '..xxxx..',
    '...xx...',
  ],
  SLOW: [
    '..xxxx..',
    '.x....x.',
    'x...x..x',
    'x...x..x',
    'x...xxxx',
    'x......x',
    '.x....x.',
    '..xxxx..',
  ],
  HINT: [
    '..xxxx..',
    '.x....x.',
    'x..x...x',
    'x.x....x',
    '.x....x.',
    '..xxxx..',
    '..xxxx..',
    '...xx...',
  ],
  TIME: [
    'xxxxxxxx',
    '.x....x.',
    '..xxxx..',
    '...xx...',
    '...xx...',
    '..x..x..',
    '.xxxxxx.',
    'xxxxxxxx',
  ],
  STAR: [
    '...xx...',
    '...xx...',
    'xxxxxxxx',
    '.xxxxxx.',
    '..xxxx..',
    '.xxxxxx.',
    '.xx..xx.',
    'xx....xx',
  ],
};

/** Khối vuông bo góc, viền tối, có vệt sáng và biểu tượng loại năng lượng ở giữa. */
export function getPowerUpBlockCells(type, color) {
  const n = POWER_UP_BLOCK_SIZE;
  const cells = [];
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const edgeX = x === 0 || x === n - 1;
      const edgeY = y === 0 || y === n - 1;
      if (edgeX && edgeY) continue;
      const shine = (y === 1 && x >= 1 && x <= 3) || (x === 1 && y === 2);
      let cellColor = color;
      if (edgeX || edgeY) cellColor = BLOCK_EDGE;
      else if (shine) cellColor = '#ffffff';
      cells.push({ x, y, color: cellColor });
    }
  }
  // Biểu tượng vẽ sau nên đè lên nền khối
  pushRows(cells, POWER_UP_ICONS[type], { x: BLOCK_EDGE }, 2, 2);
  return cells;
}

// Bán kính (ô) của vòng khiên quanh khủng long, tâm đặt giữa thân
export const SHIELD_RING_RADIUS = 13;

/** Vòng tròn pixel dày 1 ô bao quanh khủng long (toạ độ theo khung thân). */
export function getShieldRingCells(color) {
  const r = SHIELD_RING_RADIUS;
  const outer = r * r;
  const inner = (r - 1) * (r - 1);
  const cells = [];
  for (let y = -r; y <= r; y += 1) {
    for (let x = -r; x <= r; x += 1) {
      const d = x * x + y * y;
      if (d <= outer && d > inner) cells.push({ x: x + 9, y: y + 9, color });
    }
  }
  return cells;
}

/** Kích thước chướng ngại vật theo đơn vị logic Canvas (khớp hitbox với hình vẽ). */
export function getObstacleSize(type) {
  const rows = type === 'PTERODACTYL' ? PTERO_FRAMES[0] : OBSTACLE_SPRITES[type];
  return { width: rows[0].length * PIXEL, height: rows.length * PIXEL };
}

// --- Icon pixel 9x9 (tô bằng currentColor) ---

export const ICONS = {
  play: [
    '..x......',
    '..xx.....',
    '..xxx....',
    '..xxxx...',
    '..xxxxx..',
    '..xxxx...',
    '..xxx....',
    '..xx.....',
    '..x......',
  ],
  pause: [
    '.........',
    '.xxx.xxx.',
    '.xxx.xxx.',
    '.xxx.xxx.',
    '.xxx.xxx.',
    '.xxx.xxx.',
    '.xxx.xxx.',
    '.xxx.xxx.',
    '.........',
  ],
  back: [
    '.........',
    '...x.....',
    '..xx.....',
    '.xxxxxxx.',
    'xxxxxxxx.',
    '.xxxxxxx.',
    '..xx.....',
    '...x.....',
    '.........',
  ],
  close: [
    '.........',
    '.xx...xx.',
    '..xx.xx..',
    '...xxx...',
    '...xxx...',
    '..xx.xx..',
    '.xx...xx.',
    '.........',
    '.........',
  ],
  restart: [
    '..xxxxx.x',
    '.xx...xxx',
    'xx....xxx',
    'xx...xxxx',
    'xx.......',
    'xx.....xx',
    '.xx...xx.',
    '..xxxxx..',
    '.........',
  ],
  music: [
    '...xxxxx.',
    '...xxxxx.',
    '...x...x.',
    '...x...x.',
    '...x...x.',
    '.xxx.xxx.',
    'xxxxxxxx.',
    'xxxxxxxx.',
    '.xx..xx..',
  ],
  musicOff: [
    'x..xxxxx.',
    '.x.xxxxx.',
    '..xx...x.',
    '...x...x.',
    '...xx..x.',
    '.xxx.xxx.',
    'xxxxxxxx.',
    'xxxxxxxxx',
    '.xx..xx..',
  ],
  sound: [
    '....x....',
    '...xx..x.',
    'xxxxx...x',
    'xxxxx.x.x',
    'xxxxx.x.x',
    'xxxxx...x',
    '...xx..x.',
    '....x....',
    '.........',
  ],
  soundOff: [
    '....x....',
    '...xx....',
    'xxxxx.x.x',
    'xxxxx..x.',
    'xxxxx.x.x',
    'xxxxx....',
    '...xx....',
    '....x....',
    '.........',
  ],
  dino: [
    '...xxxxxx',
    '...x.xxxx',
    '...xxxxxx',
    '...xxx...',
    'x..xxxxx.',
    'xx.xxx...',
    'xxxxxxx..',
    '.xxxxx...',
    '..x..x...',
  ],
  trophy: [
    'xxxxxxxxx',
    'x.xxxxx.x',
    'x.xxxxx.x',
    '.xxxxxxx.',
    '..xxxxx..',
    '...xxx...',
    '....x....',
    '..xxxxx..',
    '..xxxxx..',
  ],
  medal: [
    '..xxxxx..',
    '.xxxxxxx.',
    'xxx...xxx',
    'xxx...xxx',
    'xxx...xxx',
    '.xxxxxxx.',
    '..xxxxx..',
    '..xx.xx..',
    '.xx...xx.',
  ],
  lock: [
    '..xxxxx..',
    '.xx...xx.',
    '.x.....x.',
    '.x.....x.',
    'xxxxxxxxx',
    'xxxx.xxxx',
    'xxxx.xxxx',
    'xxxxxxxxx',
    'xxxxxxxxx',
  ],
  check: [
    '.........',
    '........x',
    '.......xx',
    '......xx.',
    'x....xx..',
    'xx..xx...',
    '.xxxx....',
    '..xx.....',
    '.........',
  ],
  user: [
    '...xxx...',
    '..xxxxx..',
    '..xxxxx..',
    '..xxxxx..',
    '...xxx...',
    '.........',
    '.xxxxxxx.',
    'xxxxxxxxx',
    'xxxxxxxxx',
  ],
  help: [
    '..xxxxx..',
    '.xx...xx.',
    '......xx.',
    '.....xx..',
    '....xx...',
    '....xx...',
    '.........',
    '....xx...',
    '....xx...',
  ],
  print: [
    '..xxxxx..',
    '..x...x..',
    'xxxxxxxxx',
    'x.......x',
    'x.....x.x',
    'xxxxxxxxx',
    '..x...x..',
    '..xxxxx..',
    '.........',
  ],
};
