import { PADDLE_BUZZER } from '../../data/config/game-config.js';

// Số lần camera phải thấy cùng một đáp án trước khi chốt, để một khung hình đọc nhầm không thành câu trả lời
const MIN_SIGHTINGS = 3;

/**
 * Luật chơi Paddle Buzzer cho một lượt nhiều câu hỏi.
 * Mỗi câu đi qua READING (đọc đề, chưa nhận bảng) → OPEN (nhận bảng) → REVEAL (công bố); hết câu thì FINAL.
 * Nhóm được tính khi giơ bảng lên sau lúc mở và giữ yên một đáp án; đã chốt thì không đổi được.
 * Bảng giơ sẵn trong lúc đọc đề phải hạ xuống rồi giơ lại.
 * Nhóm là chỉ số 0..groupCount-1, trùng với số của mã vuông trên bảng.
 */
export class PaddleGame {
  constructor(questions, groupCount) {
    this.questions = questions;
    this.groupCount = groupCount;
    this.scores = new Array(groupCount).fill(0);
    this.index = 0;
    this.beginQuestion();
  }

  get question() {
    return this.questions[this.index];
  }

  beginQuestion() {
    this.phase = 'READING';
    // nhóm → { answer, at } đã chốt
    this.locked = new Map();
    // Các nhóm trả lời đúng, xếp từ nhanh đến chậm
    this.correctGroups = [];
    this.fastestGroup = null;
    // Lần cuối camera thấy bảng của từng nhóm (ms)
    this.lastSeen = new Array(this.groupCount).fill(-Infinity);
    // Nhóm đã hạ bảng đủ lâu nên lần giơ tới được tính
    this.armed = new Set();
    this.pending = new Map();
  }

  open(now) {
    this.phase = 'OPEN';
    this.openedAt = now;
  }

  secondsLeft(now) {
    return Math.max(0, PADDLE_BUZZER.answerTimeSec - (now - this.openedAt) / 1000);
  }

  /**
   * Nạp các bảng camera vừa thấy ([{ id, answer }]) tại thời điểm now (ms).
   * Gọi cả trong lúc đọc đề để biết nhóm nào đang giơ bảng sẵn.
   * Trả về true nếu có nhóm mới chốt hoặc câu hỏi vừa kết thúc.
   */
  update(sightings, now) {
    if (this.phase !== 'READING' && this.phase !== 'OPEN') return false;

    const seen = new Map(sightings.map((s) => [s.id, s.answer]));
    let changed = false;
    for (let group = 0; group < this.groupCount; group += 1) {
      if (this.locked.has(group)) continue;

      const answer = seen.get(group);
      if (answer === undefined) {
        // Khuất đủ lâu mới coi là đã hạ bảng; hụt một vài khung hình thì không sao
        if (now - this.lastSeen[group] >= PADDLE_BUZZER.rearmMs) {
          this.armed.add(group);
          this.pending.delete(group);
        }
        continue;
      }

      this.lastSeen[group] = now;
      if (this.phase === 'READING') {
        this.armed.delete(group);
        continue;
      }
      if (!this.armed.has(group)) continue;

      const pending = this.pending.get(group);
      if (!pending || pending.answer !== answer) {
        this.pending.set(group, { answer, since: now, count: 1 });
        continue;
      }
      pending.count += 1;
      if (pending.count >= MIN_SIGHTINGS && now - pending.since >= PADDLE_BUZZER.holdMs) {
        // Tính giờ từ lúc bảng vừa hiện ra, không phải lúc chốt
        this.locked.set(group, { answer, at: pending.since });
        changed = true;
      }
    }

    if (this.phase === 'READING') return false;
    if (this.locked.size === this.groupCount || this.secondsLeft(now) === 0) {
      this.reveal();
      return true;
    }
    return changed;
  }

  reveal() {
    this.correctGroups = [...this.locked]
      .filter(([, lock]) => lock.answer === this.question.c)
      .sort((a, b) => a[1].at - b[1].at)
      .map(([group]) => group);
    this.fastestGroup = this.correctGroups[0] ?? null;

    for (const group of this.correctGroups) {
      this.scores[group] += PADDLE_BUZZER.correctPoints;
    }
    if (this.fastestGroup !== null) {
      this.scores[this.fastestGroup] += PADDLE_BUZZER.fastestBonus;
    }
    this.phase = 'REVEAL';
  }

  next() {
    if (this.index + 1 < this.questions.length) {
      this.index += 1;
      this.beginQuestion();
    } else {
      this.phase = 'FINAL';
    }
  }
}
