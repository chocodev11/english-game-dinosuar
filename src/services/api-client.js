import { AuthService } from '../auth/auth-service.js';
import { CertificateManager } from '../certificate/certificate-manager.js';
import { LeaderboardService } from '../leaderboard/leaderboard-service.js';
import { SkinManager } from '../skins/skin-manager.js';
import { ScoreService } from './score-service.js';
import { supabase } from './supabase-client.js';

const ONLINE_LEADERBOARD_LIMIT = 50;
const ONLINE_COLUMNS = 'position, full_name, class_name, high_score, skin_id';

function mapOnlineEntry(row, profile) {
  return {
    id: `${row.full_name}__${row.class_name}`,
    rank: row.position,
    fullName: row.full_name,
    className: row.class_name,
    highScore: row.high_score,
    skinId: row.skin_id,
    isSampleData: false,
    isCurrentPlayer: Boolean(
      profile &&
        row.full_name.toLowerCase() === profile.fullName.toLowerCase() &&
        row.class_name.toLowerCase() === profile.className.toLowerCase()
    ),
  };
}

/**
 * Gửi kỷ lục hiện tại lên bảng xếp hạng Supabase (máy chủ chỉ giữ điểm cao nhất).
 * Trả về null khi không gửi được để màn hình vẫn hiển thị kết quả lưu trên máy.
 */
async function submitOnlineScore(profile, progress, skinId) {
  const { data, error } = await supabase.rpc('submit_score', {
    p_full_name: profile.fullName,
    p_class_name: profile.className,
    p_score: progress.highScore,
    p_best_mode: LeaderboardService.getBestMode(progress),
    p_milestones: progress.milestonesPassedCount,
    p_correct: progress.totalCorrectAnswers,
    p_skin_id: skinId,
  });
  if (error) {
    console.warn('[ApiClient] Không gửi được điểm lên Supabase.', error);
    return null;
  }
  return data;
}

/**
 * Lớp dịch vụ giao tiếp trung gian giữa Frontend và Backend.
 * Bảng xếp hạng dùng Supabase khi đã cấu hình biến môi trường, ngược lại lưu trên máy.
 * Cung cấp đầy đủ 7 phương thức chuẩn:
 * - login()
 * - submitScore()
 * - getLeaderboard()
 * - getPlayerProfile()
 * - getPlayerProgress()
 * - saveEquippedSkin()
 * - getCertificates()
 */
export class ApiClient {
  static isOnline() {
    return supabase !== null;
  }

  static async login(fullName, className) {
    return AuthService.login(fullName, className);
  }

  static async getPlayerProfile() {
    return AuthService.getCurrentProfile();
  }

  static async getPlayerProgress(profile) {
    const activeProfile = profile ?? AuthService.getCurrentProfile();
    return ScoreService.getPlayerProgress(activeProfile);
  }

  static async submitScore(profile, runInput) {
    const { updatedProgress, isNewHighScore } = ScoreService.recordRunResult(
      profile,
      runInput
    );

    const {
      updatedProgress: progressWithSkins,
      newlyUnlockedSkins,
    } = SkinManager.evaluateAndUnlockSkins(profile, updatedProgress);

    const equippedSkinId = SkinManager.getEquippedSkinId(profile, progressWithSkins);
    const local = LeaderboardService.upsertPlayerScore(
      profile,
      progressWithSkins,
      equippedSkinId
    );

    CertificateManager.syncAndGetCertificates(profile, progressWithSkins);

    const result = {
      syncMode: 'LOCAL_STORAGE_MOCK',
      syncedToServer: false,
      statusMessage: 'Đã ghi nhận điểm vào bộ nhớ trên máy này.',
      updatedProgress: progressWithSkins,
      isNewHighScore,
      newlyUnlockedSkins,
      leaderboard: local.leaderboard,
      playerRank: local.playerRank,
      enteredTop3: local.enteredTop3,
    };

    if (!supabase) return result;

    const online = await submitOnlineScore(profile, progressWithSkins, equippedSkinId);
    return {
      ...result,
      syncMode: 'SUPABASE',
      syncedToServer: online !== null,
      statusMessage: online
        ? 'Đã cập nhật điểm lên bảng xếp hạng trực tuyến.'
        : 'Chưa gửi được điểm lên máy chủ, điểm vẫn được lưu trên máy này.',
      playerRank: online?.rank ?? null,
      enteredTop3: Boolean(
        online && online.rank <= 3 && (online.previous_rank === null || online.previous_rank > online.rank)
      ),
    };
  }

  static async getLeaderboard(profile) {
    const activeProfile = profile ?? AuthService.getCurrentProfile();

    if (!supabase) {
      const entries = LeaderboardService.getLeaderboard(activeProfile);
      return {
        syncMode: 'LOCAL_STORAGE_MOCK',
        entries,
        me: entries.find((e) => e.isCurrentPlayer) ?? null,
      };
    }

    const [top, mine] = await Promise.all([
      supabase
        .from('leaderboard_view')
        .select(ONLINE_COLUMNS)
        .order('position')
        .limit(ONLINE_LEADERBOARD_LIMIT),
      activeProfile
        ? supabase
            .from('leaderboard_view')
            .select(ONLINE_COLUMNS)
            .eq('name_key', activeProfile.fullName.toLowerCase())
            .eq('class_key', activeProfile.className.toLowerCase())
            .maybeSingle()
        : { data: null, error: null },
    ]);
    if (top.error) throw top.error;
    if (mine.error) throw mine.error;

    return {
      syncMode: 'SUPABASE',
      entries: top.data.map((row) => mapOnlineEntry(row, activeProfile)),
      me: mine.data ? mapOnlineEntry(mine.data, activeProfile) : null,
    };
  }

  /**
   * Gọi onChange mỗi khi bảng xếp hạng trực tuyến có thay đổi. Trả về hàm hủy theo dõi.
   */
  static subscribeLeaderboard(onChange) {
    if (!supabase) return () => {};

    const channel = supabase
      .channel('leaderboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard' }, onChange)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }

  static async saveEquippedSkin(profile, progress, skinId) {
    const res = SkinManager.equipSkin(profile, progress, skinId);
    // Cập nhật skin hiển thị trên bảng xếp hạng trực tuyến nếu người chơi đã có điểm
    if (res.success && supabase && progress.gamesPlayed > 0) {
      void submitOnlineScore(profile, progress, skinId);
    }
    return res;
  }

  static async getCertificates(profile) {
    const activeProfile = profile ?? AuthService.getCurrentProfile();
    const progress = ScoreService.getPlayerProgress(activeProfile);
    return CertificateManager.syncAndGetCertificates(activeProfile, progress);
  }
}
