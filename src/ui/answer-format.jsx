import React from 'react';

export const LETTERS = ['A', 'B', 'C', 'D'];
export const LETTER_COLORS = [
  'var(--color-sky)',
  'var(--color-grape)',
  'var(--color-bubblegum)',
  'var(--color-tangerine)',
];

// Phần đặt trong {…} của câu hỏi/đáp án được gạch chân như trong đề kiểm tra
export const renderMarked = (text) =>
  text.split(/\{([^}]*)\}/).map((part, i) =>
    i % 2 ? (
      <u key={i} className="decoration-2 underline-offset-4">
        {part}
      </u>
    ) : (
      part
    )
  );
