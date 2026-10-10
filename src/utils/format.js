/** Điểm dạng 5 chữ số kiểu máy arcade: 120 -> "00120". */
export function padScore(value) {
  return String(Math.max(0, Math.floor(value))).padStart(5, '0');
}
