/**
 * Ngân hàng câu hỏi phụ riêng cho Cột mốc 100 điểm (5 câu hỏi/lượt, cần đúng ít nhất 4/5 câu).
 * Bám sát Tiếng Anh 10 Global Success, chỉ gồm nội dung Unit 1 - Unit 5 ở mức dễ.
 * Mỗi Unit 2 câu: 1 từ vựng, 1 ngữ pháp.
 */
export const MILESTONE_100_QUESTIONS = [
  // Unit 1: Family Life
  {
    q: 'Doing the ______ includes washing dishes and drying them after meals.',
    a: ['laundry', 'washing-up', 'heavy lifting', 'shopping'],
    c: 1,
  },
  {
    q: 'Every Sunday morning, my father ______ breakfast for the whole family.',
    a: ['cook', 'cooks', 'is cooking', 'cooking'],
    c: 1,
  },

  // Unit 2: Humans and the Environment
  {
    q: 'Remember to turn ______ household appliances when they are not in use.',
    a: ['on', 'up', 'off', 'into'],
    c: 2,
  },
  {
    q: 'Look at those dark clouds! It ______ rain in a few minutes.',
    a: ['is going to', 'will', 'was going to', 'would'],
    c: 0,
  },

  // Unit 3: Music
  {
    q: 'The ______ cheered loudly when their favourite singer appeared on stage.',
    a: ['judge', 'contestant', 'composer', 'audience'],
    c: 3,
  },
  {
    q: 'He wanted to attend the live concert, ______ all the tickets were sold out.',
    a: ['so', 'and', 'but', 'or'],
    c: 2,
  },

  // Unit 4: For a Better Community
  {
    q: 'The children were very ______ when they received new comic books.',
    a: ['excited', 'exciting', 'excite', 'excitement'],
    c: 0,
  },
  {
    q: 'They ______ football in the yard when it started to rain.',
    a: ['played', 'play', 'are playing', 'were playing'],
    c: 3,
  },

  // Unit 5: Inventions
  {
    q: 'You need to ______ your phone because the battery is low.',
    a: ['change', 'charge', 'chase', 'check'],
    c: 1,
  },
  {
    q: 'My grandparents have never ______ a smartphone.',
    a: ['use', 'using', 'used', 'uses'],
    c: 2,
  },
];
