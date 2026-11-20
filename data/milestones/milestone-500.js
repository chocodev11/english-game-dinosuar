import { Q_CLOSEST, Q_COMBINE, Q_MISTAKE, Q_REWRITE, Q_SOUND } from '../question-formats.js';

/**
 * Ngân hàng câu hỏi phụ riêng cho Cột mốc 500 điểm (20 câu hỏi/lượt, cần đạt tối thiểu 80% = 16/20 câu).
 * Bám sát chương trình Tiếng Anh 10 Global Success, chỉ gồm nội dung Unit 1 - Unit 5.
 * Mỗi Unit 6 câu: 2 từ vựng, 2 ngữ pháp, 1 phát âm, 1 dạng bài đề kiểm tra (giao tiếp, viết lại câu, nối câu, tìm lỗi sai, đồng nghĩa).
 */
export const MILESTONE_500_QUESTIONS = [
  // Unit 1: Family Life
  {
    q: 'Before cooking dinner, my mother usually goes to the market to buy ______.',
    a: ['laundry', 'groceries', 'chores', 'bonds'],
    c: 1,
  },
  {
    q: 'In my family, my dad does the heavy ______ like moving furniture.',
    a: ['lifting', 'carrying', 'taking', 'holding'],
    c: 0,
  },
  {
    q: 'Be quiet! The students ______ an English listening test right now.',
    a: ['take', 'took', 'are taking', 'have taken'],
    c: 2,
  },
  {
    q: '______ your brother often help your mother with the cooking?',
    a: ['Does', 'Is', 'Do', 'Has'],
    c: 0,
  },
  {
    q: Q_SOUND,
    a: ['{c}rowded', '{c}ream', '{c}ity', '{c}lean'],
    c: 2,
  },
  {
    q: 'Nam: "I think boys shouldn’t do housework."\nLan: "______ Everyone in the family should share it."',
    a: ['I totally agree.', 'I’m afraid I disagree.', 'That’s a good idea.', 'You’re right.'],
    c: 1,
  },

  // Unit 2: Humans and the Environment
  {
    q: 'Instead of throwing away old clothes, we can ______ them by turning them into bags.',
    a: ['reduce', 'reuse', 'refuse', 'remove'],
    c: 1,
  },
  {
    q: 'Plastic bags take hundreds of years to ______ in the natural environment.',
    a: ['break down', 'break out', 'turn on', 'put off'],
    c: 0,
  },
  {
    q: 'We have already bought the paint. We ______ repaint our classroom tomorrow.',
    a: ['will', 'would', 'are going to', 'were'],
    c: 2,
  },
  {
    q: 'The new metro line ______ by thousands of passengers every day.',
    a: ['is used', 'uses', 'used', 'is using'],
    c: 0,
  },
  {
    q: Q_SOUND,
    a: ['cl{ea}n', 'pl{ea}se', 'gr{ea}t', 'incr{ea}se'],
    c: 2,
  },
  {
    q: `${Q_REWRITE}Students planted 100 trees last week.`,
    a: [
      '100 trees are planted by students last week.',
      'Students were planted 100 trees last week.',
      '100 trees were planted by students last week.',
      '100 trees planted students last week.',
    ],
    c: 2,
  },

  // Unit 3: Music
  {
    q: 'Chau Van singing is an ancient form of ______ Vietnamese music.',
    a: ['modern', 'traditional', 'electronic', 'foreign'],
    c: 1,
  },
  {
    q: 'The ______ gave the young singer high scores for her amazing voice.',
    a: ['albums', 'instruments', 'concerts', 'judges'],
    c: 3,
  },
  {
    q: 'The judges decided ______ the talented guitarist to the final round.',
    a: ['send', 'sending', 'to send', 'sent'],
    c: 2,
  },
  {
    q: 'We can listen to music, ______ we can watch a film tonight.',
    a: ['or', 'so', 'but', 'for'],
    c: 0,
  },
  {
    q: 'Choose the word that has a different stress pattern from the others.',
    a: ['talent', 'guitar', 'programme', 'artist'],
    c: 1,
  },
  {
    q: `${Q_COMBINE}She loves singing. She can’t play any instruments.`,
    a: [
      'She loves singing, so she can’t play any instruments.',
      'She loves singing, or she can’t play any instruments.',
      'She loves singing, for she can’t play any instruments.',
      'She loves singing, but she can’t play any instruments.',
    ],
    c: 3,
  },

  // Unit 4: For a Better Community
  {
    q: 'Many teenagers find community service very ______ because they can help others.',
    a: ['meaningless', 'meaning', 'mean', 'meaningful'],
    c: 3,
  },
  {
    q: 'Students from our school ______ books and clothes to poor children every year.',
    a: ['donation', 'donor', 'donate', 'donating'],
    c: 2,
  },
  {
    q: 'I was reading a book about Thomas Edison when the lights suddenly ______ out.',
    a: ['went', 'go', 'goes', 'was going'],
    c: 0,
  },
  {
    q: 'What ______ you doing at 8 p.m. yesterday?',
    a: ['did', 'were', 'are', 'was'],
    c: 1,
  },
  {
    q: 'In which phrase is "record" stressed on the second syllable?',
    a: ['a world record', 'a record shop', 'to record a song', 'a school record'],
    c: 2,
  },
  {
    q: `${Q_MISTAKE}Last summer, we {volunteer} {at} a hospital {and} {met} many kind people.`,
    a: ['volunteer', 'at', 'and', 'met'],
    c: 0,
  },

  // Unit 5: Inventions
  {
    q: 'Driverless cars are equipped with smart ______ to detect obstacles on the road.',
    a: ['stoves', 'sensors', 'brooms', 'curtains'],
    c: 1,
  },
  {
    q: 'This app can ______ thousands of photos without using much memory.',
    a: ['store', 'shop', 'stay', 'stop'],
    c: 0,
  },
  {
    q: 'Since the invention of the Internet, communication ______ much faster.',
    a: ['became', 'becomes', 'has become', 'is becoming'],
    c: 2,
  },
  {
    q: 'Vacuum cleaners are very useful for ______ dust from carpets and sofas.',
    a: ['remove', 'to remove', 'removed', 'removing'],
    c: 3,
  },
  {
    q: 'Choose the word that has a different stress pattern from the others.',
    a: ['invention', 'inventor', 'connection', 'telephone'],
    c: 3,
  },
  {
    q: `${Q_CLOSEST}Laptops are {portable}, so students can take them to class.`,
    a: ['hard to use', 'easy to carry', 'cheap to buy', 'quick to charge'],
    c: 1,
  },
];
