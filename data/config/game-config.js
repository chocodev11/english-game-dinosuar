export const GAME_MODES = {
  BASIC: {
    id: 'BASIC',
    name: 'Basic',
    tagline: 'Khởi động vững chắc',
    description:
      'Nhịp độ chạy vừa phải, khoảng cách chướng ngại vật thoáng và có 15 giây suy nghĩ cho mỗi câu hỏi Tiếng Anh 10.',
    baseSpeed: 260,
    maxSpeed: 420,
    speedAcceleration: 3.5,
    obstacleMinGap: 420,
    obstacleMaxGap: 640,
    questionTimeLimitSec: 15,
    jumpVelocity: -660,
    gravity: 1850,
    allowedObstacleTypes: ['CACTUS_SMALL', 'CACTUS_CLUSTER', 'ROCK_SPIKE'],
  },
  MEDIUM: {
    id: 'MEDIUM',
    name: 'Medium',
    tagline: 'Tăng tốc phản xạ',
    description:
      'Tốc độ chạy tăng dần rõ rệt, xuất hiện thêm thằn lằn bay tầm trung và giới hạn 10 giây trả lời mỗi câu hỏi.',
    baseSpeed: 350,
    maxSpeed: 580,
    speedAcceleration: 6.0,
    obstacleMinGap: 340,
    obstacleMaxGap: 540,
    questionTimeLimitSec: 10,
    jumpVelocity: -690,
    gravity: 2000,
    allowedObstacleTypes: ['CACTUS_SMALL', 'CACTUS_CLUSTER', 'ROCK_SPIKE', 'PTERODACTYL'],
  },
  HARDCORE: {
    id: 'HARDCORE',
    name: 'HardCore',
    tagline: 'Thử thách bản lĩnh',
    description:
      'Tốc độ cao ngay từ đầu, chướng ngại vật dày đặc và áp lực trả lời câu hỏi chỉ trong 7 giây. Nhiều chướng ngại vật hơn nên có nhiều lượt nhảy (và câu hỏi) hơn.',
    baseSpeed: 460,
    maxSpeed: 760,
    speedAcceleration: 9.0,
    obstacleMinGap: 290,
    obstacleMaxGap: 460,
    questionTimeLimitSec: 7,
    jumpVelocity: -720,
    gravity: 2200,
    allowedObstacleTypes: ['CACTUS_SMALL', 'CACTUS_CLUSTER', 'ROCK_SPIKE', 'PTERODACTYL'],
  },
};

// Khối năng lượng lơ lửng giữa hai chướng ngại vật, nhảy chạm vào để nhận.
// chance: xác suất kèm một khối sau mỗi chướng ngại vật; minDistance: khoảng cách tối thiểu giữa hai khối.
export const POWER_UP_SPAWN = {
  chance: 0.16,
  minDistance: 1500,
};

// weight: tỷ lệ xuất hiện tương đối giữa các loại khối
export const POWER_UPS = {
  SHIELD: { id: 'SHIELD', name: 'Khiên bảo vệ', color: '#38bdf8', weight: 30 },
  SLOW: { id: 'SLOW', name: 'Chậm lại', color: '#a3e635', weight: 25, durationSec: 7, speedFactor: 0.6 },
  HINT: { id: 'HINT', name: '50/50', color: '#facc15', weight: 20, charges: 2 },
  TIME: { id: 'TIME', name: '+5 giây', color: '#fb923c', weight: 15, charges: 3, bonusSec: 5 },
  STAR: { id: 'STAR', name: 'Bất tử', color: '#f472b6', weight: 10, durationSec: 6 },
};

// Môi trường đặc biệt chỉ thỉnh thoảng xuất hiện: hết mỗi đoạn nền thường (tính theo thời gian chạy)
// có specialChance khả năng chuyển sang một môi trường đặc biệt, hết thời lượng thì quay về nền thường.
// Môi trường mới tràn vào từ mép phải cùng tốc độ chạy.
export const ENVIRONMENT_SCHEDULE = {
  normalDurationSec: [16, 28],
  specialChance: 0.5,
};

export const ENVIRONMENTS = {
  METEOR_SHOWER: { id: 'METEOR_SHOWER', name: 'Mưa thiên thạch', color: '#fb923c', weight: 25, durationSec: [14, 22] },
  SHOOTING_STARS: { id: 'SHOOTING_STARS', name: 'Mưa sao băng', color: '#c7d2fe', weight: 30, durationSec: [14, 22] },
  UNDERSEA: { id: 'UNDERSEA', name: 'Dưới đáy biển', color: '#5eead4', weight: 25, durationSec: [16, 24] },
  SAKURA: { id: 'SAKURA', name: 'Mưa hoa anh đào', color: '#f9a8d4', weight: 20, durationSec: [14, 22] },
};

export const DEFAULT_MILESTONE_PASS_RATIO = 0.8;

// Điểm của một lượt = số câu trả lời đúng. Cột mốc tính theo số câu đúng trong lượt;
// mỗi câu đúng trong thử thách cũng được +1, vượt mốc để mở skin và chứng chỉ.
// id giữ nguyên tên cũ vì đã dùng làm khóa lưu tiến độ và tên file ngân hàng câu hỏi.
export const MILESTONE_CONFIGS = [
  {
    id: 'MILESTONE_100',
    scoreThreshold: 10,
    questionCount: 5,
    passRatio: DEFAULT_MILESTONE_PASS_RATIO,
    minCorrectOverride: 4,
    title: 'Thử thách cột mốc 10 câu đúng',
    description: 'Trả lời 5 câu hỏi phụ, đúng ít nhất 4 câu để vượt mốc.',
  },
  {
    id: 'MILESTONE_500',
    scoreThreshold: 30,
    questionCount: 10,
    passRatio: DEFAULT_MILESTONE_PASS_RATIO,
    title: 'Thử thách cột mốc 30 câu đúng',
    description: 'Trả lời 10 câu hỏi phụ, đúng ít nhất 8 câu để vượt mốc.',
  },
  {
    id: 'MILESTONE_1000',
    scoreThreshold: 60,
    questionCount: 15,
    passRatio: DEFAULT_MILESTONE_PASS_RATIO,
    title: 'Thử thách cột mốc 60 câu đúng',
    description: 'Trả lời 15 câu hỏi phụ, đúng ít nhất 12 câu để vượt mốc.',
  },
  {
    id: 'MILESTONE_2000_PLUS',
    scoreThreshold: 100,
    isRecurringFromThreshold: true,
    recurringStep: 50,
    questionCount: 20,
    passRatio: DEFAULT_MILESTONE_PASS_RATIO,
    title: 'Đại thử thách từ 100 câu đúng',
    description: 'Cứ mỗi 50 câu đúng từ mốc 100: trả lời 20 câu hỏi phụ, đúng ít nhất 16 câu để vượt mốc.',
  },
];

// minHighScore: số câu đúng kỷ lục trong một lượt; minTotalCorrect: số câu đúng tích lũy
export const CERTIFICATE_REQUIREMENTS = [
  {
    id: 'CERT_STARTER_100',
    title: 'Chứng nhận Khởi hành Tiếng Anh 10',
    englishTitle: 'Grade 10 English Runner — Foundation Certificate',
    description: 'Trả lời đúng ít nhất 10 câu trong một lượt chơi và tích lũy 20 câu đúng.',
    minHighScore: 10,
    minMilestoneCleared: 0,
    minTotalCorrect: 20,
    badgeLevel: 'BRONZE',
  },
  {
    id: 'CERT_SCHOLAR_500',
    title: 'Chứng nhận Chinh phục Cột mốc',
    englishTitle: 'Global Success Grade 10 — Silver Scholar Certificate',
    description: 'Trả lời đúng ít nhất 30 câu trong một lượt và vượt qua ít nhất 1 thử thách cột mốc.',
    minHighScore: 30,
    minMilestoneCleared: 1,
    minTotalCorrect: 60,
    badgeLevel: 'SILVER',
  },
  {
    id: 'CERT_MASTER_1000',
    title: 'Chứng nhận Tinh thông Tiếng Anh 10',
    englishTitle: 'Global Success Grade 10 — Gold Mastery Certificate',
    description: 'Trả lời đúng ít nhất 60 câu trong một lượt và vượt qua ít nhất 2 thử thách cột mốc.',
    minHighScore: 60,
    minMilestoneCleared: 2,
    minTotalCorrect: 150,
    badgeLevel: 'GOLD',
  },
  {
    id: 'CERT_LEGEND_2000',
    title: 'Chứng nhận Huyền thoại Khủng Long Học Tập',
    englishTitle: 'English Game Dinosaur — Grand Honor Distinction',
    description: 'Trả lời đúng ít nhất 100 câu trong một lượt và vượt qua ít nhất 3 thử thách cột mốc.',
    minHighScore: 100,
    minMilestoneCleared: 3,
    minTotalCorrect: 300,
    badgeLevel: 'HONOR',
  },
];
