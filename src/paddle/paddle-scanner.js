// Số dải dọc quét song song ở độ phân giải đầy đủ, dành cho bảng nhỏ ở xa.
// Mỗi dải một worker; chừa 2 nhân cho giao diện và lượt quét cả khung hình.
const STRIPS = Math.min(8, Math.max(2, (navigator.hardwareConcurrency || 4) - 2));
// Mỗi dải lấn sang trái chừng này (px) để bảng nằm vắt qua ranh giới vẫn trọn trong một dải
const OVERLAP = 128;
// Bảng to hơn OVERLAP (đứng sát máy) do lượt quét cả khung hình thu nhỏ đảm nhận
const WIDE_SCALE = 0.25;

const newContext = () => document.createElement('canvas').getContext('2d', { willReadFrequently: true });

/**
 * Quét bảng trong khung hình camera bằng nhiều worker chạy song song để theo kịp tốc độ camera.
 * Mọi mảnh của cùng một khung hình được chờ xong rồi mới trả kết quả, nên bảng gần hay xa đều
 * được nhận ở cùng một thời điểm.
 */
export class PaddleScanner {
  constructor() {
    this.workers = Array.from(
      { length: STRIPS + 1 },
      () => new Worker(new URL('./paddle-scan.worker.js', import.meta.url), { type: 'module' })
    );
    this.full = newContext();
    this.wide = newContext();
  }

  /** Trả về Promise<[{ id, answer }]> cho khung hình hiện tại của video. */
  scan(video) {
    const { full, wide } = this;
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (full.canvas.width !== width || full.canvas.height !== height) {
      full.canvas.width = width;
      full.canvas.height = height;
      wide.canvas.width = Math.round(width * WIDE_SCALE);
      wide.canvas.height = Math.round(height * WIDE_SCALE);
    }
    full.drawImage(video, 0, 0);
    wide.drawImage(video, 0, 0, wide.canvas.width, wide.canvas.height);

    const parts = [wide.getImageData(0, 0, wide.canvas.width, wide.canvas.height)];
    const core = Math.ceil(width / STRIPS);
    for (let i = 0; i < STRIPS; i += 1) {
      const left = Math.max(0, i * core - OVERLAP);
      parts.push(full.getImageData(left, 0, Math.min(width, (i + 1) * core) - left, height));
    }

    const jobs = parts.map(
      (part, i) =>
        new Promise((resolve, reject) => {
          const worker = this.workers[i];
          worker.onmessage = (e) => resolve(e.data);
          worker.onerror = reject;
          worker.postMessage({ width: part.width, height: part.height, buffer: part.data.buffer }, [
            part.data.buffer,
          ]);
        })
    );

    // Một bảng có thể nằm trong hai mảnh chồng nhau; gộp theo số mã
    return Promise.all(jobs).then((results) => {
      const paddles = new Map();
      for (const found of results) {
        for (const paddle of found) paddles.set(paddle.id, paddle);
      }
      return [...paddles.values()];
    });
  }

  close() {
    for (const worker of this.workers) worker.terminate();
  }
}
