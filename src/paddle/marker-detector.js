import aruco from 'js-aruco2';
import cvModule from 'js-aruco2/src/cv.js';
import 'js-aruco2/src/dictionaries/aruco_4x4_1000.js';
import { PADDLE_BUZZER } from '../../data/config/game-config.js';

const { AR } = aruco;
const { CV } = cvModule;

// Bộ mã 4x4 có ô to nhất nên nhận được từ xa nhất; chỉ giữ mã của các nhóm đang chơi.
// Tối đa 20 mã đầu thì hai mã bất kỳ (kể cả khi xoay) khác nhau ít nhất 5 ô, nên sửa được mã đọc sai
// MAX_WRONG_CELLS ô mà không nhầm sang nhóm khác hay chữ khác.
const DICTIONARY_NAME = 'PADDLE_4X4';
AR.DICTIONARIES[DICTIONARY_NAME] = {
  nBits: 16,
  codeList: AR.DICTIONARIES.ARUCO_4X4_1000.codeList.slice(0, PADDLE_BUZZER.groupCount),
};

// Cạnh ngắn nhất (px) của một ô vuông đen còn được xét là mã
const MIN_EDGE_PX = 8;
// Ô vuông nghi là mã được nắn phẳng thành lưới 8x8 ô: 4x4 ô mã, viền đen 1 ô, ngoài cùng là viền trắng 1 ô của tờ giấy
const GRID = 8;
const CODE_GRID = 4;
const CELL_PX = 8;
const WARP_SIZE = GRID * CELL_PX;
// Chỉ đo phần giữa mỗi ô; mép ô là chỗ bị nhòe sang ô bên cạnh
const CELL_PAD = 2;
const MAX_WRONG_CELLS = 2;
// Ô đọc sai chỉ được bỏ qua khi độ sáng của nó cách ngưỡng đen/trắng không quá chừng này (tính theo khoảng đen-trắng của bảng).
// Bảng xa bị nhòe thì ô sai luôn là ô lưng chừng; đồ vật trông giống mã thì ô sai đen/trắng rõ ràng nên bị loại.
const WRONG_CELL_MARGIN = 0.2;
// Hai cạnh trên cùng phải chênh độ cao ít nhất chừng này (theo cạnh mã), ứng với nghiêng không quá khoảng 40°
const DIAGONAL_MARGIN = 0.12;

const detector = new AR.Detector({ dictionaryName: DICTIONARY_NAME });
const warped = new CV.Image(WARP_SIZE, WARP_SIZE, new Uint8Array(WARP_SIZE * WARP_SIZE));
const cells = new Float32Array(GRID * GRID);

// Thư viện mặc định dùng mảng thường cho ảnh xám/nhị phân; cấp sẵn mảng kiểu số theo cỡ khung hình cho nhanh.
// Ảnh nhị phân chứa cả nhãn đường viền (số âm, có thể lớn) nên cần Int32.
function sizeBuffers(width, height) {
  if (detector.grey.data.length === width * height) return;
  detector.grey = new CV.Image(width, height, new Uint8Array(width * height));
  detector.thres = new CV.Image(width, height, new Uint8Array(width * height));
  detector.binary = new Int32Array((width + 2) * (height + 2));
}

/** Ảnh SVG của mã số `id` để in lên bảng, đã kèm viền trắng rộng 1 ô. */
export const getMarkerSvg = (id) => detector.dictionary.generateSVG(id);

/**
 * Đọc mã trong ô vuông đen `candidate` (4 góc theo chiều kim đồng hồ) của ảnh xám.
 * Trả về { id, corners } với corners đã xoay về đúng chiều của mã, hoặc null nếu không phải bảng của nhóm nào.
 * Thay cho findMarkers của thư viện: thư viện cắt ngưỡng đen/trắng trên riêng phần mã nên đọc sai nhiều khi bảng nhòe,
 * và nhận mọi mã sai ít ô kể cả khi ô sai rõ ràng.
 */
function readMarker(candidate) {
  // Nới ô vuông ra mỗi bên 1 ô để lấy cả viền trắng làm mốc màu trắng
  const centerX = (candidate[0].x + candidate[1].x + candidate[2].x + candidate[3].x) / 4;
  const centerY = (candidate[0].y + candidate[1].y + candidate[2].y + candidate[3].y) / 4;
  const scale = GRID / (GRID - 2);
  const outer = candidate.map(({ x, y }) => ({
    x: centerX + (x - centerX) * scale,
    y: centerY + (y - centerY) * scale,
  }));
  CV.warp(detector.grey, warped, outer, WARP_SIZE);

  let white = 0;
  let black = 0;
  for (let row = 0; row < GRID; row += 1) {
    for (let col = 0; col < GRID; col += 1) {
      let sum = 0;
      for (let y = row * CELL_PX + CELL_PAD; y < (row + 1) * CELL_PX - CELL_PAD; y += 1) {
        for (let x = col * CELL_PX + CELL_PAD; x < (col + 1) * CELL_PX - CELL_PAD; x += 1) {
          sum += warped.data[y * WARP_SIZE + x];
        }
      }
      cells[row * GRID + col] = sum;
      if (row === 0 || col === 0 || row === GRID - 1 || col === GRID - 1) white += sum;
      else if (row === 1 || col === 1 || row === GRID - 2 || col === GRID - 2) black += sum;
    }
  }
  // Mốc trắng = trung bình viền trắng (28 ô), mốc đen = trung bình viền đen (20 ô)
  white /= 4 * GRID - 4;
  black /= 4 * GRID - 12;
  const range = white - black;
  if (range <= 0) return null;
  const threshold = (white + black) / 2;

  // Viền đen phải đen hết
  for (let i = 1; i < GRID - 1; i += 1) {
    if (
      cells[GRID + i] > threshold ||
      cells[(GRID - 2) * GRID + i] > threshold ||
      cells[i * GRID + 1] > threshold ||
      cells[i * GRID + GRID - 2] > threshold
    ) {
      return null;
    }
  }

  let bits = [];
  // Ô nào đen/trắng rõ ràng (xa ngưỡng) thì không được phép đọc sai
  let sure = [];
  for (let row = 0; row < CODE_GRID; row += 1) {
    bits[row] = [];
    sure[row] = [];
    for (let col = 0; col < CODE_GRID; col += 1) {
      const cell = cells[(row + 2) * GRID + col + 2];
      bits[row][col] = cell > threshold ? '1' : '0';
      sure[row][col] = Math.abs(cell - threshold) > range * WRONG_CELL_MARGIN;
    }
  }

  const { codeList } = detector.dictionary;
  let best = null;
  for (let turn = 0; turn < 4; turn += 1) {
    for (let id = 0; id < codeList.length; id += 1) {
      const code = codeList[id];
      let wrong = 0;
      for (let i = 0; i < code.length && wrong <= MAX_WRONG_CELLS; i += 1) {
        const row = Math.floor(i / CODE_GRID);
        const col = i % CODE_GRID;
        if (bits[row][col] === code[i]) continue;
        wrong = sure[row][col] ? Infinity : wrong + 1;
      }
      if (wrong <= MAX_WRONG_CELLS && (!best || wrong < best.wrong)) best = { id, turn, wrong };
    }
    bits = detector.rotate(bits);
    sure = detector.rotate(sure);
  }
  return best && { id: best.id, corners: detector.rotate2(candidate, 4 - best.turn) };
}

/**
 * Tìm các bảng trong một khung hình hoặc một mảnh khung hình ({ width, height, data } dạng RGBA).
 * Trả về [{ id, answer, corners }]; answer là cạnh của mã đang quay lên trên: 0 = A (cạnh trên), 1 = B (phải), 2 = C (dưới), 3 = D (trái);
 * corners là 4 góc của mã ({ x, y } theo px của ảnh đưa vào).
 */
export function detectPaddles(image) {
  sizeBuffers(image.width, image.height);

  // Chạy lại các bước của AR.Detector.detect nhưng bỏ bước notTooNear: bước đó loại ô vuông nằm cách
  // ô khác dưới 10px, nên mã nhỏ ở xa bị chính mép tờ giấy trắng quanh nó che mất.
  CV.grayscale(image, detector.grey);
  CV.adaptiveThreshold(detector.grey, detector.thres, 2, 7);
  const contours = CV.findContours(detector.thres, detector.binary);
  const candidates = detector.clockwiseCorners(
    detector.findCandidates(contours, image.width * 0.01, 0.05, MIN_EDGE_PX)
  );

  const paddles = new Map();
  for (const candidate of candidates) {
    const marker = readMarker(candidate);
    if (!marker) continue;
    const { id, corners } = marker;
    // Độ cao của từng cạnh = tổng y hai đầu mút; cạnh có tổng nhỏ nhất là cạnh nằm trên cùng
    let answer = 0;
    let topY = Infinity;
    let nextY = Infinity;
    for (let i = 0; i < 4; i += 1) {
      const y = corners[i].y + corners[(i + 1) % 4].y;
      if (y < topY) {
        nextY = topY;
        topY = y;
        answer = i;
      } else if (y < nextY) {
        nextY = y;
      }
    }
    // Bảng cầm chéo gần 45° thì hai cạnh cao ngang nhau, không rõ nhóm chọn chữ nào nên bỏ qua
    const side = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
    if (nextY - topY < side * DIAGONAL_MARGIN) continue;
    paddles.set(id, { id, answer, corners });
  }
  return [...paddles.values()];
}
