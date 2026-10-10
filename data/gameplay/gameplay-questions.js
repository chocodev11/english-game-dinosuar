/**
 * Ngân hàng câu hỏi sử dụng trực tiếp trong Gameplay (vượt chướng ngại vật).
 * Bám sát chương trình Tiếng Anh 10 Global Success, chỉ gồm nội dung Unit 1 - Unit 5.
 * Mỗi Unit 10 câu: 4 từ vựng, 4 ngữ pháp, 2 phát âm.
 * Cấu trúc bắt buộc: { q: string, a: string[], c: number }
 */
export const GAMEPLAY_QUESTIONS = [
  // Unit 1: Family Life (việc nhà; hiện tại đơn & hiện tại tiếp diễn; /br/, /kr/, /tr/)
  {
    q: 'My mother does the ______ every Sunday, so we always have clean clothes.',
    a: ['washing-up', 'shopping', 'laundry', 'cooking'],
    c: 2,
  },
  {
    q: 'A ______ is a person who stays at home to look after the house and family.',
    a: ['breadwinner', 'neighbour', 'teenager', 'homemaker'],
    c: 3,
  },
  {
    q: 'Usually, my sister washes the dishes and I ______ out the rubbish.',
    a: ['take', 'make', 'do', 'give'],
    c: 0,
  },
  {
    q: 'My father is the ______ of the family, while my mother manages the household budget.',
    a: ['homemaker', 'breadwinner', 'guest', 'teenager'],
    c: 1,
  },
  {
    q: 'My mother usually ______ the cooking, but today my father is cooking.',
    a: ['do', 'does', 'is doing', 'did'],
    c: 1,
  },
  {
    q: 'Listen! Someone ______ the piano in the living room right now.',
    a: ['plays', 'played', 'is playing', 'has played'],
    c: 2,
  },
  {
    q: 'At the moment, my grandparents ______ in the garden.',
    a: ['are working', 'work', 'works', 'worked'],
    c: 0,
  },
  {
    q: 'Lan can’t answer the phone now because she ______ her homework.',
    a: ['does', 'did', 'do', 'is doing'],
    c: 3,
  },
  {
    q: 'Which word does NOT begin with the sound /br/?',
    a: ['bread', 'brother', 'cream', 'breakfast'],
    c: 2,
  },
  {
    q: 'Which word begins with the sound /tr/?',
    a: ['children', 'tradition', 'dream', 'present'],
    c: 1,
  },

  // Unit 2: Humans and the Environment (sống xanh; will & be going to, bị động; /kl/, /pl/, /gr/, /pr/)
  {
    q: 'Using reusable bags instead of plastic ones helps reduce our carbon ______.',
    a: ['footprint', 'footstep', 'shadow', 'signal'],
    c: 0,
  },
  {
    q: 'Organic vegetables are grown without the use of harmful ______.',
    a: ['appliances', 'litter', 'energy', 'chemicals'],
    c: 3,
  },
  {
    q: 'Please don’t drop ______ on the beach. Put it in the bin.',
    a: ['energy', 'awareness', 'appliances', 'litter'],
    c: 3,
  },
  {
    q: 'Bamboo straws are ______ because they do not harm the environment.',
    a: ['harmful', 'eco-friendly', 'wasteful', 'single-use'],
    c: 1,
  },
  {
    q: 'A: The bin is full. B: OK, I ______ take it out right now.',
    a: ['will', 'am going to', 'was going to', 'would'],
    c: 0,
  },
  {
    q: 'More trees ______ in our school yard by the Youth Union next Sunday.',
    a: ['will plant', 'are planting', 'will be planted', 'planted'],
    c: 2,
  },
  {
    q: 'Plastic bottles ______ into useful products at this factory.',
    a: ['recycle', 'are recycled', 'are recycling', 'recycled'],
    c: 1,
  },
  {
    q: 'The beach ______ by a group of volunteers last weekend.',
    a: ['cleaned', 'is cleaning', 'cleans', 'was cleaned'],
    c: 3,
  },
  {
    q: 'Which word contains the consonant blend /pl/?',
    a: ['practice', 'clean', 'plastic', 'green'],
    c: 2,
  },
  {
    q: 'Which word begins with the sound /kl/?',
    a: ['climate', 'protect', 'planet', 'grass'],
    c: 0,
  },

  // Unit 3: Music (âm nhạc; câu ghép, to V & V nguyên mẫu; trọng âm từ 2 âm tiết)
  {
    q: 'Each ______ in the talent show has two minutes to impress the judges.',
    a: ['audience', 'album', 'contestant', 'award'],
    c: 2,
  },
  {
    q: 'My favourite band is going to ______ a new song next month.',
    a: ['relax', 'release', 'remove', 'reduce'],
    c: 1,
  },
  {
    q: 'The singer’s first ______ sold over a million copies in its first week.',
    a: ['album', 'audience', 'award', 'judge'],
    c: 0,
  },
  {
    q: 'A person who writes music is called a ______.',
    a: ['conductor', 'contestant', 'judge', 'composer'],
    c: 3,
  },
  {
    q: 'She practised singing for months, ______ she won the first prize in the contest.',
    a: ['or', 'but', 'so', 'yet'],
    c: 2,
  },
  {
    q: 'My brother likes rock music, ______ my sister prefers folk songs.',
    a: ['but', 'so', 'or', 'for'],
    c: 0,
  },
  {
    q: 'My parents let me ______ the school music club this term.',
    a: ['to join', 'joining', 'join', 'joined'],
    c: 2,
  },
  {
    q: 'She wants ______ a famous singer like her idol.',
    a: ['become', 'to become', 'becoming', 'became'],
    c: 1,
  },
  {
    q: 'Choose the word that has a different stress pattern from the others.',
    a: ['singer', 'music', 'concert', 'perform'],
    c: 3,
  },
  {
    q: 'Choose the word that has a different stress pattern from the others.',
    a: ['relax', 'album', 'enjoy', 'compose'],
    c: 1,
  },

  // Unit 4: For a Better Community (tình nguyện; tính từ -ed/-ing/-ful/-less; quá khứ đơn & quá khứ tiếp diễn; trọng âm từ cùng cách viết)
  {
    q: 'The charity organisation has provided shelter for ______ people in the city.',
    a: ['careless', 'homeless', 'endless', 'harmless'],
    c: 1,
  },
  {
    q: 'Teaching at the village school was a truly ______ experience for all of us.',
    a: ['rewarded', 'reward', 'rewards', 'rewarding'],
    c: 3,
  },
  {
    q: 'Many students ______ at the local orphanage every weekend to teach the children.',
    a: ['volunteer', 'donate', 'raise', 'provide'],
    c: 0,
  },
  {
    q: 'It’s ______ to leave rubbish on the beach after a picnic.',
    a: ['careless', 'careful', 'caring', 'cared'],
    c: 0,
  },
  {
    q: 'While we ______ clothes for charity, the headmaster visited our booth.',
    a: ['sorted', 'are sorting', 'were sorting', 'have sorted'],
    c: 2,
  },
  {
    q: 'Mai ______ her bike when she saw an old man fall down.',
    a: ['was riding', 'rode', 'rides', 'is riding'],
    c: 0,
  },
  {
    q: '______ you take part in the charity run last Sunday?',
    a: ['Were', 'Do', 'Did', 'Was'],
    c: 2,
  },
  {
    q: 'We ______ to the radio when we heard the news about the storm.',
    a: ['listened', 'were listening', 'listen', 'are listening'],
    c: 1,
  },
  {
    q: 'Which one is stressed on the FIRST syllable?',
    a: ['to record', 'a record', 'to present', 'to export'],
    c: 1,
  },
  {
    q: 'Which one is stressed on the SECOND syllable?',
    a: ['a present', 'an increase', 'a desert', 'to permit'],
    c: 3,
  },

  // Unit 5: Inventions (phát minh; hiện tại hoàn thành, V-ing & to V chỉ công dụng/mục đích; trọng âm danh từ 3 âm tiết)
  {
    q: 'This new laptop is lightweight and ______, so you can carry it anywhere.',
    a: ['bulky', 'portable', 'heavy', 'broken'],
    c: 1,
  },
  {
    q: 'Thomas Edison is one of the most famous ______ in history.',
    a: ['inventions', 'invent', 'inventors', 'inventive'],
    c: 2,
  },
  {
    q: 'A smartphone is a small ______ that can do many different things.',
    a: ['device', 'devise', 'divide', 'advice'],
    c: 0,
  },
  {
    q: 'The new phone has a large ______, so reading on it is easy.',
    a: ['scene', 'scream', 'screen', 'scheme'],
    c: 2,
  },
  {
    q: 'Over the last decade, scientists ______ many new tools to improve healthcare.',
    a: ['invent', 'invented', 'are inventing', 'have invented'],
    c: 3,
  },
  {
    q: 'I ______ this laptop for three years, and it still works well.',
    a: ['have used', 'used', 'am using', 'use'],
    c: 0,
  },
  {
    q: 'A 3D printer is used for ______ solid objects.',
    a: ['produce', 'producing', 'to produce', 'produced'],
    c: 1,
  },
  {
    q: 'A drone is used ______ photos from the sky.',
    a: ['taking', 'take', 'took', 'to take'],
    c: 3,
  },
  {
    q: 'Choose the word that has a different stress pattern from the others.',
    a: ['camera', 'battery', 'computer', 'satellite'],
    c: 2,
  },
  {
    q: 'Which word is stressed on the FIRST syllable?',
    a: ['invention', 'computer', 'connection', 'factory'],
    c: 3,
  },
];
