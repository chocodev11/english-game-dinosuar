import { Q_CLOSEST, Q_MISTAKE, Q_OPPOSITE, Q_SOUND, Q_STRESS } from '../question-formats.js';

/**
 * Ngân hàng câu hỏi sử dụng trực tiếp trong Gameplay (vượt chướng ngại vật).
 * Bám sát chương trình Tiếng Anh 10 Global Success, chỉ gồm nội dung Unit 1 - Unit 5.
 * Mỗi Unit 20 câu theo các dạng bài của đề kiểm tra: 2 phát âm/trọng âm, 6 từ vựng,
 * 2 đồng nghĩa/trái nghĩa, 6 ngữ pháp, 2 tìm lỗi sai, 2 giao tiếp.
 * Câu đề ngắn để đọc và trả lời kịp trong 15 giây.
 * Cấu trúc bắt buộc: { q: string, a: string[], c: number }
 */
export const GAMEPLAY_QUESTIONS = [
  // Unit 1: Family Life (việc nhà; hiện tại đơn & hiện tại tiếp diễn; /br/, /kr/, /tr/; nêu ý kiến)
  {
    q: Q_SOUND,
    a: ['{ch}ores', '{ch}ildren', '{ch}aracter', '{ch}eer'],
    c: 2,
  },
  {
    q: Q_SOUND,
    a: ['br{ea}kfast', 'cl{ea}n', 'br{ea}d', 'h{ea}vy'],
    c: 1,
  },
  {
    q: 'My mother does the ______ every Sunday, so we always have clean clothes.',
    a: ['laundry', 'washing-up', 'shopping', 'cooking'],
    c: 0,
  },
  {
    q: 'My father is the ______ of the family; he earns money to support us.',
    a: ['homemaker', 'babysitter', 'housekeeper', 'breadwinner'],
    c: 3,
  },
  {
    q: 'It’s my turn to ______ out the rubbish tonight.',
    a: ['make', 'put', 'do', 'give'],
    c: 1,
  },
  {
    q: 'Children should show ______ to their parents for everything they do.',
    a: ['grateful', 'gratefully', 'gratitude', 'gratify'],
    c: 2,
  },
  {
    q: 'We often shop ______ groceries at the supermarket near our house.',
    a: ['for', 'at', 'with', 'of'],
    c: 0,
  },
  {
    q: 'Housework should be ______ equally among all family members.',
    a: ['spent', 'saved', 'sent', 'shared'],
    c: 3,
  },
  {
    q: `${Q_CLOSEST}We do {household chores} together at weekends.`,
    a: ['homework', 'housework', 'teamwork', 'schoolwork'],
    c: 1,
  },
  {
    q: `${Q_OPPOSITE}Sharing housework can {strengthen} family bonds.`,
    a: ['improve', 'build', 'weaken', 'connect'],
    c: 2,
  },
  {
    q: 'My mother usually ______ the cooking, but today my father is cooking.',
    a: ['do', 'does', 'is doing', 'did'],
    c: 1,
  },
  {
    q: 'Listen! Someone ______ the piano in the living room.',
    a: ['plays', 'played', 'has played', 'is playing'],
    c: 3,
  },
  {
    q: 'My dad ______ dinner at the moment, so he can’t answer the phone.',
    a: ['is cooking', 'cooks', 'cooked', 'cook'],
    c: 0,
  },
  {
    q: 'How often ______ your brother do the washing-up?',
    a: ['do', 'is', 'does', 'are'],
    c: 2,
  },
  {
    q: 'Mai ______ the plants every morning before school.',
    a: ['waters', 'water', 'is watering', 'watering'],
    c: 0,
  },
  {
    q: 'He ______ like doing the laundry, but he does it every week.',
    a: ['don’t', 'isn’t', 'aren’t', 'doesn’t'],
    c: 3,
  },
  {
    q: `${Q_MISTAKE}Look! My sister {washes} {the dishes} {in} {the kitchen}.`,
    a: ['washes', 'the dishes', 'in', 'the kitchen'],
    c: 0,
  },
  {
    q: `${Q_MISTAKE}My brother and I {often} {helps} our mother {with} {the cooking}.`,
    a: ['often', 'helps', 'with', 'the cooking'],
    c: 1,
  },
  {
    q: 'Nam: "I think children should do housework."\nLan: "______ It teaches them life skills."',
    a: ['Never mind.', 'Not at all.', 'I agree with you.', 'I don’t think so.'],
    c: 2,
  },
  {
    q: 'Mai: "What do you think about sharing housework?"\nHoa: "______"',
    a: ['Yes, I do.', 'You’re welcome.', 'I’m fine, thanks.', 'In my opinion, it’s necessary.'],
    c: 3,
  },

  // Unit 2: Humans and the Environment (sống xanh; will & be going to, bị động; /kl/, /pl/, /gr/, /pr/; hỏi & cho lời khuyên)
  {
    q: Q_SOUND,
    a: ['pl{a}ce', 'pl{a}net', 'pl{a}stic', 'pr{a}ctice'],
    c: 0,
  },
  {
    q: Q_SOUND,
    a: ['clean{ed}', 'recycl{ed}', 'us{ed}', 'plant{ed}'],
    c: 3,
  },
  {
    q: 'Using reusable bags helps reduce our carbon ______.',
    a: ['footstep', 'footprint', 'shadow', 'signal'],
    c: 1,
  },
  {
    q: 'Remember to turn off household ______ when you leave the room.',
    a: ['applicants', 'applications', 'appliances', 'approaches'],
    c: 2,
  },
  {
    q: 'Bamboo straws are ______ because they do not harm the environment.',
    a: ['eco-friendly', 'harmful', 'wasteful', 'single-use'],
    c: 0,
  },
  {
    q: 'Our club is going to clean ______ the beach this weekend.',
    a: ['on', 'at', 'for', 'up'],
    c: 3,
  },
  {
    q: 'The air ______ in big cities is getting worse.',
    a: ['pollute', 'pollution', 'polluted', 'polluting'],
    c: 1,
  },
  {
    q: 'Many farmers now grow ______ vegetables without using chemicals.',
    a: ['plastic', 'electric', 'organic', 'harmful'],
    c: 2,
  },
  {
    q: `${Q_CLOSEST}We should {reduce} the amount of plastic we use.`,
    a: ['cut down on', 'put up with', 'look forward to', 'run out of'],
    c: 0,
  },
  {
    q: `${Q_OPPOSITE}Plastic waste is {harmful} to sea animals.`,
    a: ['dangerous', 'poisonous', 'useful', 'harmless'],
    c: 3,
  },
  {
    q: 'A: "The bin is full."\nB: "OK, I ______ take it out right now."',
    a: ['am going to', 'will', 'was going to', 'would'],
    c: 1,
  },
  {
    q: 'Watch out! That tree ______ fall.',
    a: ['will be', 'goes to', 'is going to', 'was going to'],
    c: 2,
  },
  {
    q: 'More trees ______ in our school yard next Sunday.',
    a: ['will be planted', 'will plant', 'are planting', 'planted'],
    c: 0,
  },
  {
    q: 'Plastic bottles ______ into useful products at this factory.',
    a: ['recycle', 'are recycling', 'recycled', 'are recycled'],
    c: 3,
  },
  {
    q: 'The beach ______ by volunteers last weekend.',
    a: ['cleaned', 'was cleaned', 'is cleaning', 'cleans'],
    c: 1,
  },
  {
    q: 'Earth Hour ______ every year in March.',
    a: ['holds', 'is holding', 'is held', 'held'],
    c: 2,
  },
  {
    q: `${Q_MISTAKE}Last year, {a lot of} trees {in} this park {was planted} {by} students.`,
    a: ['a lot of', 'in', 'was planted', 'by'],
    c: 2,
  },
  {
    q: `${Q_MISTAKE}The rubbish {in} our street {is collect} {every} {morning}.`,
    a: ['in', 'is collect', 'every', 'morning'],
    c: 1,
  },
  {
    q: 'Nam: "I want to live greener. What should I do?"\nMai: "______"',
    a: ['You should use less plastic.', 'Yes, I’d love to.', 'I’m sorry to hear that.', 'It’s my pleasure.'],
    c: 0,
  },
  {
    q: 'Lan: "You should turn off the lights when you leave."\nHoa: "______"',
    a: ['No, I wasn’t.', 'Here you are.', 'Yes, I do.', 'Thanks for your advice.'],
    c: 3,
  },

  // Unit 3: Music (âm nhạc; câu ghép, to V & V nguyên mẫu; trọng âm từ 2 âm tiết; đề nghị & đáp lại)
  {
    q: Q_STRESS,
    a: ['singer', 'music', 'concert', 'perform'],
    c: 3,
  },
  {
    q: Q_STRESS,
    a: ['artist', 'talent', 'award', 'single'],
    c: 2,
  },
  {
    q: 'Each ______ in the talent show has two minutes to impress the judges.',
    a: ['contestant', 'audience', 'album', 'award'],
    c: 0,
  },
  {
    q: 'My favourite band is going to ______ a new single next month.',
    a: ['relax', 'release', 'remove', 'reduce'],
    c: 1,
  },
  {
    q: 'She was ______ in the first round and had to leave the show.',
    a: ['celebrated', 'decorated', 'eliminated', 'educated'],
    c: 2,
  },
  {
    q: 'Thousands of fans took ______ in the music festival.',
    a: ['place', 'turn', 'time', 'part'],
    c: 3,
  },
  {
    q: 'She is a very ______ singer with a beautiful voice.',
    a: ['talented', 'talent', 'talents', 'talently'],
    c: 0,
  },
  {
    q: 'I’d rather watch a ______ concert than listen to a recording.',
    a: ['alive', 'live', 'living', 'lively'],
    c: 1,
  },
  {
    q: `${Q_CLOSEST}Many young people {take part in} singing contests.`,
    a: ['look for', 'give up', 'turn off', 'participate in'],
    c: 3,
  },
  {
    q: `${Q_OPPOSITE}Her first album was a great {success}.`,
    a: ['victory', 'failure', 'performance', 'talent'],
    c: 1,
  },
  {
    q: 'She practised hard, ______ she won the first prize.',
    a: ['or', 'but', 'so', 'yet'],
    c: 2,
  },
  {
    q: 'My brother likes rock music, ______ my sister prefers folk songs.',
    a: ['but', 'so', 'or', 'for'],
    c: 0,
  },
  {
    q: 'Hurry up, ______ we’ll miss the opening song.',
    a: ['and', 'or', 'so', 'but'],
    c: 1,
  },
  {
    q: 'My parents let me ______ the school music club.',
    a: ['to join', 'joining', 'join', 'joined'],
    c: 2,
  },
  {
    q: 'She hopes ______ a famous singer one day.',
    a: ['become', 'becoming', 'became', 'to become'],
    c: 3,
  },
  {
    q: 'They decided ______ a band after school.',
    a: ['to form', 'form', 'forming', 'formed'],
    c: 0,
  },
  {
    q: `${Q_MISTAKE}My teacher made {me} {to sing} {in front of} {the class}.`,
    a: ['me', 'to sing', 'in front of', 'the class'],
    c: 1,
  },
  {
    q: `${Q_MISTAKE}The tickets {were} expensive, {but} we decided {buying} {them}.`,
    a: ['were', 'but', 'buying', 'them'],
    c: 2,
  },
  {
    q: 'Nam: "Let’s go to the music festival this weekend."\nMai: "______"',
    a: ['Great idea! I’d love to.', 'Yes, I do.', 'Not at all.', 'You’re welcome.'],
    c: 0,
  },
  {
    q: 'Lan: "______"\nHoa: "Sorry, I can’t. I have to study."',
    a: [
      'What kind of music do you like?',
      'Who is your favourite singer?',
      'Did you enjoy the show?',
      'How about going to the concert tonight?',
    ],
    c: 3,
  },

  // Unit 4: For a Better Community (tình nguyện; tính từ -ed/-ing/-ful/-less; quá khứ đơn & quá khứ tiếp diễn; trọng âm từ cùng cách viết; bày tỏ cảm xúc)
  {
    q: Q_STRESS,
    a: ['local', 'remote', 'support', 'involve'],
    c: 0,
  },
  {
    q: 'Which underlined word is stressed on the SECOND syllable?',
    a: ['a birthday {present}', 'a world {record}', 'an {increase} in prices', 'to {export} rice'],
    c: 3,
  },
  {
    q: 'The charity provides shelter for ______ people in the city.',
    a: ['careless', 'homeless', 'endless', 'harmless'],
    c: 1,
  },
  {
    q: 'Many students ______ at the local orphanage to teach the children.',
    a: ['donate', 'raise', 'volunteer', 'provide'],
    c: 2,
  },
  {
    q: 'It takes hours to reach the ______ village in the mountains.',
    a: ['remote', 'nearby', 'central', 'modern'],
    c: 0,
  },
  {
    q: 'Teaching the village children was a truly ______ experience.',
    a: ['rewarded', 'reward', 'rewards', 'rewarding'],
    c: 3,
  },
  {
    q: 'I’m ______ in joining the volunteer club.',
    a: ['interest', 'interested', 'interesting', 'interests'],
    c: 1,
  },
  {
    q: 'Thanks for the tips. They were really ______.',
    a: ['helpless', 'helping', 'helpful', 'helped'],
    c: 2,
  },
  {
    q: `${Q_CLOSEST}We {donate} old books to the village library.`,
    a: ['give away', 'take off', 'look after', 'turn down'],
    c: 0,
  },
  {
    q: `${Q_OPPOSITE}Mr Nam is very {generous}; he often helps the poor.`,
    a: ['kind', 'helpful', 'friendly', 'selfish'],
    c: 3,
  },
  {
    q: 'While we ______ rubbish, it started to rain.',
    a: ['collected', 'were collecting', 'are collecting', 'have collected'],
    c: 1,
  },
  {
    q: 'Mai ______ her bike when she saw an old man fall.',
    a: ['rode', 'rides', 'was riding', 'is riding'],
    c: 2,
  },
  {
    q: '______ you take part in the charity run last Sunday?',
    a: ['Did', 'Were', 'Do', 'Was'],
    c: 0,
  },
  {
    q: 'At 8 p.m. last night, we ______ gifts for the children.',
    a: ['wrap', 'wrapped', 'are wrapping', 'were wrapping'],
    c: 3,
  },
  {
    q: 'I was cooking for the homeless when the phone ______.',
    a: ['was ringing', 'rang', 'rings', 'is ringing'],
    c: 1,
  },
  {
    q: 'We ______ over 50 million dong for charity last month.',
    a: ['raise', 'were raising', 'raised', 'have raised'],
    c: 2,
  },
  {
    q: `${Q_MISTAKE}We {was} {cleaning} the park {when} it {started} to rain.`,
    a: ['was', 'cleaning', 'when', 'started'],
    c: 0,
  },
  {
    q: `${Q_MISTAKE}When the children {got} {the gifts}, they {were} very {exciting}.`,
    a: ['got', 'the gifts', 'were', 'exciting'],
    c: 3,
  },
  {
    q: 'Nam: "We raised 20 million dong for charity!"\nMai: "______"',
    a: ['I’m sorry to hear that.', 'Wow! That’s amazing!', 'No, thanks.', 'Take care.'],
    c: 1,
  },
  {
    q: 'Lan: "The charity concert was cancelled."\nHoa: "______"',
    a: ['Congratulations!', 'That’s great news!', 'Oh no! What a pity!', 'Well done!'],
    c: 2,
  },

  // Unit 5: Inventions (phát minh; hiện tại hoàn thành, V-ing & to V chỉ công dụng/mục đích; trọng âm danh từ 3 âm tiết; yêu cầu & đáp lại)
  {
    q: Q_STRESS,
    a: ['camera', 'battery', 'computer', 'satellite'],
    c: 2,
  },
  {
    q: Q_STRESS,
    a: ['benefit', 'inventor', 'customer', 'scientist'],
    c: 1,
  },
  {
    q: 'This laptop is lightweight and ______, so you can carry it anywhere.',
    a: ['portable', 'bulky', 'heavy', 'broken'],
    c: 0,
  },
  {
    q: 'A smartphone is a small ______ that can do many different things.',
    a: ['devise', 'divide', 'advice', 'device'],
    c: 3,
  },
  {
    q: 'Scientists do ______ in laboratories to test new ideas.',
    a: ['experiences', 'experiments', 'exercises', 'examples'],
    c: 1,
  },
  {
    q: 'Press this ______ to turn on the computer.',
    a: ['bottom', 'battery', 'button', 'bottle'],
    c: 2,
  },
  {
    q: 'The telephone is one of the greatest ______ of all time.',
    a: ['inventions', 'invent', 'inventors', 'inventive'],
    c: 0,
  },
  {
    q: 'Programs and apps on a computer are called ______.',
    a: ['hardware', 'keyboards', 'screens', 'software'],
    c: 3,
  },
  {
    q: `${Q_CLOSEST}Computers can {store} a huge amount of information.`,
    a: ['lose', 'keep', 'send', 'delete'],
    c: 1,
  },
  {
    q: `${Q_OPPOSITE}Modern laptops are {light} and easy to carry.`,
    a: ['thin', 'cheap', 'heavy', 'small'],
    c: 2,
  },
  {
    q: 'Computers ______ our lives a lot since they were invented.',
    a: ['have changed', 'change', 'changed', 'are changing'],
    c: 0,
  },
  {
    q: 'I ______ this laptop for three years, and it still works well.',
    a: ['used', 'am using', 'use', 'have used'],
    c: 3,
  },
  {
    q: 'She hasn’t finished her science project ______.',
    a: ['already', 'yet', 'just', 'since'],
    c: 1,
  },
  {
    q: 'A 3D printer is used for ______ solid objects.',
    a: ['produce', 'to produce', 'producing', 'produced'],
    c: 2,
  },
  {
    q: 'A drone is used ______ photos from the sky.',
    a: ['to take', 'taking', 'take', 'took'],
    c: 0,
  },
  {
    q: 'Smartphones allow us ______ in touch with friends easily.',
    a: ['keep', 'keeping', 'kept', 'to keep'],
    c: 3,
  },
  {
    q: `${Q_MISTAKE}I {have bought} this smartphone two years ago, {and} it {still} {works} well.`,
    a: ['have bought', 'and', 'still', 'works'],
    c: 0,
  },
  {
    q: `${Q_MISTAKE}This app {is used} for {learn} English {vocabulary} {easily}.`,
    a: ['is used', 'learn', 'vocabulary', 'easily'],
    c: 1,
  },
  {
    q: 'Nam: "Could you lend me your laptop for a minute?"\nMai: "______"',
    a: ['Yes, I could.', 'No, I don’t.', 'Sure. Here you are.', 'Good idea.'],
    c: 2,
  },
  {
    q: 'Lan: "Can you help me install this app, please?"\nHoa: "______ I’m busy right now."',
    a: ['Sure.', 'No problem.', 'Of course.', 'I’m afraid I can’t.'],
    c: 3,
  },
];
