import { DEFAULT_SKIN_ID } from '../../data/skins/skins.js';
import { STORAGE_KEYS, StorageService } from '../services/storage-service.js';

const INITIAL_SAMPLE_ENTRIES = [
  {
    id: 'sample_1',
    skinId: 'skin_inferno_drake',
    fullName: 'Nguyễn Minh Khôi',
    className: '10A1',
    highScore: 58,
    bestMode: 'HARDCORE',
    milestonesPassed: 3,
    correctAnswers: 240,
    achievedAt: '2026-10-01T08:30:00.000Z',
    isSampleData: true,
  },
  {
    id: 'sample_2',
    skinId: 'skin_sakura_breeze',
    fullName: 'Trần Lê Bảo Ngọc',
    className: '10A2',
    highScore: 44,
    bestMode: 'MEDIUM',
    milestonesPassed: 3,
    correctAnswers: 190,
    achievedAt: '2026-10-02T09:15:00.000Z',
    isSampleData: true,
  },
  {
    id: 'sample_3',
    skinId: 'skin_arctic_glacier',
    fullName: 'Lê Hoàng Nam',
    className: '10A1',
    highScore: 31,
    bestMode: 'MEDIUM',
    milestonesPassed: 2,
    correctAnswers: 120,
    achievedAt: '2026-10-03T14:20:00.000Z',
    isSampleData: true,
  },
  {
    id: 'sample_4',
    skinId: 'skin_amber_scholar',
    fullName: 'Phạm Thu Hà',
    className: '10C1',
    highScore: 22,
    bestMode: 'BASIC',
    milestonesPassed: 1,
    correctAnswers: 75,
    achievedAt: '2026-10-04T10:00:00.000Z',
    isSampleData: true,
  },
  {
    id: 'sample_5',
    skinId: 'skin_cobalt_sprinter',
    fullName: 'Vũ Đức Anh',
    className: '10B3',
    highScore: 12,
    bestMode: 'BASIC',
    milestonesPassed: 1,
    correctAnswers: 40,
    achievedAt: '2026-10-05T16:45:00.000Z',
    isSampleData: true,
  },
];

export class LeaderboardService {
  static sortEntries(entries) {
    return [...entries]
      .filter(
        (item) =>
          item &&
          typeof item.fullName === 'string' &&
          item.fullName.trim().length > 0 &&
          typeof item.highScore === 'number' &&
          Number.isFinite(item.highScore) &&
          item.highScore >= 0
      )
      .sort((a, b) => {
        if (b.highScore !== a.highScore) return b.highScore - a.highScore;
        if (b.milestonesPassed !== a.milestonesPassed) {
          return b.milestonesPassed - a.milestonesPassed;
        }
        if (b.correctAnswers !== a.correctAnswers) {
          return b.correctAnswers - a.correctAnswers;
        }
        return (
          new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime()
        );
      });
  }

  static getRawEntries() {
    const saved = StorageService.get(STORAGE_KEYS.LEADERBOARD, null);
    if (!saved || !Array.isArray(saved) || saved.length === 0) {
      StorageService.set(STORAGE_KEYS.LEADERBOARD, INITIAL_SAMPLE_ENTRIES);
      return [...INITIAL_SAMPLE_ENTRIES];
    }
    return saved;
  }

  static getLeaderboard(currentProfile) {
    const raw = this.getRawEntries();
    const sorted = this.sortEntries(raw);

    return sorted.map((entry, idx) => {
      const isCurrentPlayer = Boolean(
        currentProfile &&
          !entry.isSampleData &&
          entry.fullName.toLowerCase() ===
            currentProfile.fullName.toLowerCase() &&
          entry.className.toLowerCase() ===
            currentProfile.className.toLowerCase()
      );

      // Bản ghi mẫu đã lưu từ phiên bản cũ chưa có skinId thì lấy lại từ dữ liệu mẫu gốc
      const skinId =
        entry.skinId ||
        INITIAL_SAMPLE_ENTRIES.find((s) => s.id === entry.id)?.skinId ||
        DEFAULT_SKIN_ID;

      return {
        ...entry,
        skinId,
        rank: idx + 1,
        isCurrentPlayer,
      };
    });
  }

  static getBestMode(progress) {
    const { BASIC, MEDIUM, HARDCORE } = progress.modeHighScores;
    if (HARDCORE > 0 && HARDCORE >= MEDIUM && HARDCORE >= BASIC) return 'HARDCORE';
    if (MEDIUM > 0 && MEDIUM >= BASIC) return 'MEDIUM';
    return progress.lastMode || 'BASIC';
  }

  static upsertPlayerScore(profile, progress, skinId = DEFAULT_SKIN_ID) {
    const currentBoard = this.getLeaderboard(profile);
    const prevPlayerEntry = currentBoard.find((e) => e.isCurrentPlayer);
    const previousRank = prevPlayerEntry ? prevPlayerEntry.rank : null;

    const raw = this.getRawEntries();
    const matchIndex = raw.findIndex(
      (e) =>
        !e.isSampleData &&
        e.fullName.toLowerCase() === profile.fullName.toLowerCase() &&
        e.className.toLowerCase() === profile.className.toLowerCase()
    );

    const updatedItem = {
      id: profile.internalPlayerId,
      skinId,
      fullName: profile.fullName,
      className: profile.className,
      highScore: progress.highScore,
      bestMode: this.getBestMode(progress),
      milestonesPassed: progress.milestonesPassedCount,
      correctAnswers: progress.totalCorrectAnswers,
      achievedAt:
        matchIndex >= 0 && raw[matchIndex].highScore >= progress.highScore
          ? raw[matchIndex].achievedAt
          : new Date().toISOString(),
      isSampleData: false,
    };

    if (matchIndex >= 0) {
      raw[matchIndex] = updatedItem;
    } else {
      raw.push(updatedItem);
    }

    StorageService.set(STORAGE_KEYS.LEADERBOARD, raw);

    const updatedBoard = this.getLeaderboard(profile);
    const newPlayerEntry = updatedBoard.find((e) => e.isCurrentPlayer);
    const playerRank = newPlayerEntry ? newPlayerEntry.rank : null;

    const enteredTop3 =
      playerRank !== null &&
      playerRank <= 3 &&
      (previousRank === null || previousRank > playerRank);

    return {
      leaderboard: updatedBoard,
      playerRank,
      previousRank,
      enteredTop3,
    };
  }
}
