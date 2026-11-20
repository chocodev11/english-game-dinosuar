import React from 'react';
import { LETTERS } from '../ui/answer-format';
import { getMarkerSvg } from './marker-detector';

// Chỗ đặt chữ ở giữa 4 cạnh (trên, phải, dưới, trái): cạnh nào quay lên trên thì chữ ở cạnh đó đứng thẳng
const EDGE_STYLES = [
  { top: '2mm', left: '50%', transform: 'translateX(-50%)' },
  { right: '2mm', top: '50%', transform: 'translateY(-50%) rotate(90deg)' },
  { bottom: '2mm', left: '50%', transform: 'translateX(-50%) rotate(180deg)' },
  { left: '2mm', top: '50%', transform: 'translateY(-50%) rotate(-90deg)' },
];
// Mặt sau nhìn ngược chiều nên hai cạnh trái/phải đổi chỗ cho nhau
const BACK_LETTERS = [0, 3, 2, 1];

function EdgeLetters({ order }) {
  return order.map((letter, edge) => (
    <span
      key={letter}
      className="absolute text-[10mm] font-bold leading-none text-[#555]"
      style={EDGE_STYLES[edge]}
    >
      {LETTERS[letter]}
    </span>
  ));
}

/**
 * Bản in bảng trả lời: mỗi nhóm 2 trang A4 (mặt trước có mã vuông, mặt sau có số nhóm).
 * Chữ A/B/C/D nằm ở mép ngoài viền trắng, cách ô đen hơn 1 cm để không ảnh hưởng việc nhận mã.
 */
export function PaddlePrintSheet({ groupCount }) {
  return Array.from({ length: groupCount }, (_, id) => (
    <React.Fragment key={id}>
      <section className="break-after-page text-center text-[#2b2b2b]">
        <div className="relative mx-auto size-[180mm]">
          <div
            className="size-full [&>svg]:block [&>svg]:size-full [&>svg]:[shape-rendering:crispEdges]"
            dangerouslySetInnerHTML={{ __html: getMarkerSvg(id) }}
          />
          <EdgeLetters order={[0, 1, 2, 3]} />
        </div>
        <p className="mt-[8mm] text-[7mm] font-bold">Nhóm {id + 1} · mặt trước</p>
        <p className="mx-auto mt-[3mm] max-w-[150mm] text-[4.5mm] leading-snug">
          Cắt theo hình vuông rồi dán lên bìa cứng, giữ nguyên viền trắng quanh ô đen. Không ép plastic bóng.
          Khi giơ bảng, cầm ở mép và đừng để tay che ô đen.
        </p>
      </section>
      <section className="break-after-page text-center text-[#2b2b2b]">
        <div className="relative mx-auto grid size-[180mm] place-items-center outline-dashed outline-1 outline-[#999]">
          <div>
            <p className="text-[12mm] font-bold leading-none">Nhóm</p>
            <p className="text-[70mm] font-bold leading-none">{id + 1}</p>
          </div>
          <EdgeLetters order={BACK_LETTERS} />
        </div>
        <p className="mt-[8mm] text-[7mm] font-bold">Nhóm {id + 1} · mặt sau</p>
        <p className="mx-auto mt-[3mm] max-w-[150mm] text-[4.5mm] leading-snug">
          Dán mặt này ra sau bảng. Xoay bảng để chữ của đáp án mình chọn nằm trên cùng, rồi giơ mặt có mã về phía camera.
        </p>
      </section>
    </React.Fragment>
  ));
}
