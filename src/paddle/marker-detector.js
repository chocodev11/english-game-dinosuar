import aruco from 'js-aruco2';
import cvModule from 'js-aruco2/src/cv.js';
import 'js-aruco2/src/dictionaries/aruco_4x4_1000.js';

const { AR } = aruco;
const { CV } = cvModule;

// Bộ mã 4x4 có ô to nhất nên nhận được từ xa nhất; chỉ giữ MAX_PADDLES mã đầu (trùng DICT_4X4_50 của OpenCV)
const MAX_PADDLES = 50;
const DICTIONARY_NAME = 'PADDLE_4X4';
AR.DICTIONARIES[DICTIONARY_NAME] = {
  nBits: 16,
  // Chấp nhận mã đọc lệch tối đa 1 ô
  tau: 2,
  codeList: AR.DICTIONARIES.ARUCO_4X4_1000.codeList.slice(0, MAX_PADDLES),
};

// Cạnh ngắn nhất (px) của một ô vuông đen còn được xét là mã
const MIN_EDGE_PX = 8;
const WARP_SIZE = 49;

const detector = new AR.Detector({ dictionaryName: DICTIONARY_NAME });

/** Ảnh SVG của mã số `id` để in lên bảng, đã kèm viền trắng rộng 1 ô. */
export const getMarkerSvg = (id) => detector.dictionary.generateSVG(id);

/**
 * Tìm các bảng trong một khung hình (ImageData).
 * Trả về [{ id, answer }]; answer là cạnh của mã đang quay lên trên: 0 = A (cạnh trên), 1 = B (phải), 2 = C (dưới), 3 = D (trái).
 */
export function detectPaddles(image) {
  // Chạy lại các bước của AR.Detector.detect nhưng bỏ bước notTooNear: bước đó loại ô vuông nằm cách
  // ô khác dưới 10px, nên mã nhỏ ở xa bị chính mép tờ giấy trắng quanh nó che mất.
  CV.grayscale(image, detector.grey);
  CV.adaptiveThreshold(detector.grey, detector.thres, 2, 7);
  const contours = CV.findContours(detector.thres, detector.binary);
  const candidates = detector.clockwiseCorners(
    detector.findCandidates(contours, image.width * 0.01, 0.05, MIN_EDGE_PX)
  );

  const paddles = new Map();
  for (const { id, corners } of detector.findMarkers(detector.grey, candidates, WARP_SIZE)) {
    let answer = 0;
    let topY = Infinity;
    for (let i = 0; i < 4; i += 1) {
      const y = corners[i].y + corners[(i + 1) % 4].y;
      if (y < topY) {
        topY = y;
        answer = i;
      }
    }
    paddles.set(id, { id, answer });
  }
  return [...paddles.values()];
}
