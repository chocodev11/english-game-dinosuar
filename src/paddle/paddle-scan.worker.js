import { detectPaddles } from './marker-detector.js';

// Nhận một mảnh khung hình (RGBA) từ PaddleScanner, trả về các bảng tìm thấy trong mảnh đó
self.onmessage = ({ data: { width, height, buffer } }) => {
  self.postMessage(detectPaddles({ width, height, data: new Uint8ClampedArray(buffer) }));
};
