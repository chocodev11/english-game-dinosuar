import { Q_CLOSEST, Q_MISTAKE, Q_OPPOSITE, Q_REWRITE, Q_SOUND } from '../question-formats.js';

/**
 * Ngân hàng câu hỏi phụ riêng cho Cột mốc từ 2.000 điểm trở lên (50 câu hỏi/lượt, cần đạt tối thiểu 80% = 40/50 câu).
 * Bám sát chương trình Tiếng Anh 10 Global Success, chỉ gồm nội dung Unit 1 - Unit 5 ở mức khó hơn.
 * Mỗi Unit 13 câu: 4 từ vựng, 5 ngữ pháp, 2 phát âm, 2 dạng bài đề kiểm tra (tìm lỗi sai, giao tiếp, viết lại câu, đồng nghĩa/trái nghĩa).
 */
export const MILESTONE_2000_QUESTIONS = [
  // Unit 1: Family Life
  {
    q: 'Spending time together helps parents build a close ______ with their children.',
    a: ['appliance', 'relationship', 'allowance', 'ingredient'],
    c: 1,
  },
  {
    q: 'Children who do housework develop a sense of ______ and independence.',
    a: ['responsible', 'responsibly', 'responsibility', 'irresponsible'],
    c: 2,
  },
  {
    q: 'My parents always divide household chores ______ so no one feels overwhelmed.',
    a: ['equal', 'equality', 'unequal', 'equally'],
    c: 3,
  },
  {
    q: 'Sharing housework with your parents is a good way to show your ______ for their hard work.',
    a: ['gratitude', 'character', 'routine', 'burden'],
    c: 0,
  },
  {
    q: 'Look! My dad ______ the broken bicycle for my little brother in the yard.',
    a: ['repairs', 'is repairing', 'repaired', 'repair'],
    c: 1,
  },
  {
    q: 'My mother ______ coffee in the morning, but today she is drinking tea.',
    a: ['is usually drinking', 'drinks usually', 'usually drinks', 'usually drink'],
    c: 2,
  },
  {
    q: 'In Viet Nam, many families ______ the Lunar New Year together every year.',
    a: ['is celebrating', 'celebrates', 'are celebrating', 'celebrate'],
    c: 3,
  },
  {
    q: 'How often ______ your parents go shopping for groceries?',
    a: ['do', 'does', 'are', 'is'],
    c: 0,
  },
  {
    q: 'This week my brother ______ the dishes because my mother is on a business trip.',
    a: ['washes', 'is washing', 'wash', 'washed'],
    c: 1,
  },
  {
    q: Q_SOUND,
    a: ['{h}ousework', '{h}usband', '{h}onest', '{h}eavy'],
    c: 2,
  },
  {
    q: Q_SOUND,
    a: ['h{ou}sework', 'h{ou}sehold', 'ab{ou}t', 'r{ou}tine'],
    c: 3,
  },
  {
    q: `${Q_MISTAKE}My father {is} the breadwinner, {so} he {is going} {to work} every day.`,
    a: ['is', 'so', 'is going', 'to work'],
    c: 2,
  },
  {
    q: 'Minh: "In my opinion, sharing housework makes families closer."\nAn: "______ It also teaches children responsibility."',
    a: [
      'I couldn’t agree more.',
      'I don’t think so.',
      'That’s not true.',
      'I’m not sure about that.',
    ],
    c: 0,
  },

  // Unit 2: Humans and the Environment
  {
    q: 'Switching to LED light bulbs is a simple way to cut down on electricity ______.',
    a: ['consumption', 'invention', 'collection', 'permission'],
    c: 0,
  },
  {
    q: 'Avoid single-use plastic straws; instead, choose bamboo or metal ______.',
    a: ['pollutants', 'alternatives', 'emissions', 'disasters'],
    c: 1,
  },
  {
    q: 'More and more young people are leading a green ______ by cycling to school.',
    a: ['footprint', 'appliance', 'lifestyle', 'awareness'],
    c: 2,
  },
  {
    q: 'We should ______ green living habits to protect the environment.',
    a: ['adapt', 'admit', 'adept', 'adopt'],
    c: 3,
  },
  {
    q: 'All plastic bottles collected from the school festival ______ to a recycling plant tomorrow.',
    a: ['will be sent', 'will send', 'sent', 'are sending'],
    c: 0,
  },
  {
    q: 'We ______ plant trees in the park next weekend. We have already bought the young trees.',
    a: ['are going', 'are going to', 'going to', 'will to'],
    c: 1,
  },
  {
    q: 'Scientists predict that the Earth ______ much hotter by 2050.',
    a: ['was', 'is being', 'will be', 'has been'],
    c: 2,
  },
  {
    q: 'A lot of energy ______ when we leave the lights on all day.',
    a: ['wastes', 'is wasting', 'wasted', 'is wasted'],
    c: 3,
  },
  {
    q: 'Hundreds of trees ______ in our city every year.',
    a: ['are cut down', 'cut down', 'are cutting down', 'have cut down'],
    c: 0,
  },
  {
    q: Q_SOUND,
    a: ['bottle{s}', 'plant{s}', 'bag{s}', 'tree{s}'],
    c: 1,
  },
  {
    q: Q_SOUND,
    a: ['{ch}arity', '{ch}ange', '{ch}emical', '{ch}oose'],
    c: 2,
  },
  {
    q: `${Q_REWRITE}People throw away tons of plastic every day.`,
    a: [
      'Tons of plastic is throwing away every day.',
      'Tons of plastic were thrown away every day.',
      'Tons of plastic throw away every day.',
      'Tons of plastic are thrown away every day.',
    ],
    c: 3,
  },
  {
    q: `${Q_OPPOSITE}Cars {release} harmful gases into the air.`,
    a: ['produce', 'absorb', 'send', 'create'],
    c: 1,
  },

  // Unit 3: Music
  {
    q: 'Traditional musical instruments reflect the rich cultural ______ of ethnic groups.',
    a: ['invention', 'software', 'laundry', 'identity'],
    c: 3,
  },
  {
    q: 'The band’s live ______ last night was fantastic.',
    a: ['performance', 'perform', 'performer', 'performed'],
    c: 0,
  },
  {
    q: 'Music can help people ______ after a long day at school.',
    a: ['release', 'relax', 'record', 'reduce'],
    c: 1,
  },
  {
    q: 'Many young people are big ______ of K-pop and watch every new music video.',
    a: ['judges', 'composers', 'fans', 'contestants'],
    c: 2,
  },
  {
    q: 'Her voice was very powerful, ______ the judges gave her a standing ovation.',
    a: ['but', 'or', 'nor', 'so'],
    c: 3,
  },
  {
    q: 'The concert was cancelled, ______ the singer was ill.',
    a: ['for', 'so', 'or', 'nor'],
    c: 0,
  },
  {
    q: 'Did the music teacher make the choir ______ the song three times?',
    a: ['to rehearse', 'rehearse', 'rehearsing', 'rehearsed'],
    c: 1,
  },
  {
    q: 'You should ______ to music to relax before an exam.',
    a: ['to listen', 'listening', 'listen', 'listened'],
    c: 2,
  },
  {
    q: 'My parents won’t let me ______ to the late-night concert.',
    a: ['to go', 'going', 'went', 'go'],
    c: 3,
  },
  {
    q: 'Choose the word that has a different stress pattern from the others.',
    a: ['success', 'idol', 'single', 'rhythm'],
    c: 0,
  },
  {
    q: 'Which word is stressed on the SECOND syllable?',
    a: ['lyrics', 'career', 'rapper', 'drummer'],
    c: 1,
  },
  {
    q: `${Q_REWRITE}The tickets were sold out, so we watched the show online.`,
    a: [
      'We watched the show online, so the tickets were sold out.',
      'The tickets were sold out, or we watched the show online.',
      'We watched the show online because the tickets were sold out.',
      'We watched the show online, but the tickets weren’t sold out.',
    ],
    c: 2,
  },
  {
    q: `${Q_CLOSEST}The band will {release} a new album soon.`,
    a: ['bring out', 'put off', 'take off', 'turn down'],
    c: 0,
  },

  // Unit 4: For a Better Community
  {
    q: 'It was ______ to see how quickly the community rebuilt the library after the flood.',
    a: ['amaze', 'amazed', 'amazing', 'amazement'],
    c: 2,
  },
  {
    q: 'Donating blood is a noble act that can save the lives of many ______ patients.',
    a: ['injuring', 'injure', 'injury', 'injured'],
    c: 3,
  },
  {
    q: 'Our school raised money to build a library for children in ______ areas.',
    a: ['remote', 'remotely', 'remoteness', 'remoted'],
    c: 0,
  },
  {
    q: 'Thanks to the volunteers, the clean-up campaign was very ______.',
    a: ['success', 'successful', 'succeed', 'successfully'],
    c: 1,
  },
  {
    q: 'When the teacher walked into the room, the students ______ their group project, so they didn’t notice him.',
    a: ['discussed', 'discuss', 'were discussing', 'have discussed'],
    c: 2,
  },
  {
    q: 'The volunteers arrived at the village while local people ______ sandbags along the river.',
    a: ['placed', 'place', 'have placed', 'were placing'],
    c: 3,
  },
  {
    q: 'She ______ her finger while she was making cakes for the charity fair.',
    a: ['cut', 'was cutting', 'cuts', 'is cutting'],
    c: 0,
  },
  {
    q: 'At this time last week, we ______ food to the flood victims.',
    a: ['delivered', 'were delivering', 'deliver', 'have delivered'],
    c: 1,
  },
  {
    q: 'When the earthquake happened, many people ______ in their offices.',
    a: ['worked', 'work', 'were working', 'have worked'],
    c: 2,
  },
  {
    q: 'Which one has a different stress pattern?',
    a: ['an export', 'an import', 'a protest', 'to increase'],
    c: 3,
  },
  {
    q: 'Which one is stressed on the FIRST syllable?',
    a: ['a conflict', 'to object', 'to permit', 'to record'],
    c: 0,
  },
  {
    q: `${Q_MISTAKE}I {was meeting} my best friend {while} I {was volunteering} {at} an animal shelter.`,
    a: ['was meeting', 'while', 'was volunteering', 'at'],
    c: 0,
  },
  {
    q: `${Q_REWRITE}During our visit to the orphanage, it started to rain.`,
    a: [
      'While it was starting to rain, we visited the orphanage.',
      'While we were visiting the orphanage, it started to rain.',
      'We visited the orphanage after it started to rain.',
      'It started to rain before we visited the orphanage.',
    ],
    c: 1,
  },

  // Unit 5: Inventions
  {
    q: 'Earbuds are very ______ for listening to music while jogging.',
    a: ['convenience', 'convenient', 'inconvenience', 'conveniently'],
    c: 1,
  },
  {
    q: 'One ______ of using a laptop is that you can work anywhere.',
    a: ['beneficial', 'beneficially', 'benefit', 'benefited'],
    c: 2,
  },
  {
    q: 'A smartphone’s processor and RAM determine how ______ it can run many apps.',
    a: ['smooth', 'smoother', 'smoothness', 'smoothly'],
    c: 3,
  },
  {
    q: 'Smartphones have become an ______ part of our daily lives.',
    a: ['essential', 'essence', 'essentially', 'essentials'],
    c: 0,
  },
  {
    q: 'Since AI chatbots were introduced, customer service ______ significantly.',
    a: ['improved', 'has improved', 'improves', 'was improving'],
    c: 1,
  },
  {
    q: 'The first mobile phone ______ in 1973.',
    a: ['has been made', 'is made', 'was made', 'has made'],
    c: 2,
  },
  {
    q: 'Smartphones allow users ______ video calls to people far away.',
    a: ['make', 'making', 'made', 'to make'],
    c: 3,
  },
  {
    q: 'Velcro is used for ______ clothes, shoes and bags quickly without buttons.',
    a: ['fastening', 'fasten', 'to fasten', 'fastened'],
    c: 0,
  },
  {
    q: 'The invention of the compass allowed sailors ______ across oceans safely.',
    a: ['navigate', 'to navigate', 'navigating', 'navigated'],
    c: 1,
  },
  {
    q: 'Choose the word that has a different stress pattern from the others.',
    a: ['scientist', 'microwave', 'achievement', 'internet'],
    c: 2,
  },
  {
    q: 'Choose the word that has a different stress pattern from the others.',
    a: ['microphone', 'telescope', 'customer', 'inventor'],
    c: 3,
  },
  {
    q: `${Q_REWRITE}This is the first time I have used a 3D printer.`,
    a: [
      'I have used a 3D printer many times.',
      'I used a 3D printer a long time ago.',
      'I didn’t use a 3D printer anymore.',
      'I have never used a 3D printer before.',
    ],
    c: 3,
  },
  {
    q: `${Q_MISTAKE}Robots {have done} many dangerous jobs for humans {since} they {have been} {invented}.`,
    a: ['have done', 'since', 'have been', 'invented'],
    c: 2,
  },
];
