import React, { useCallback, useState } from 'react';
import { GAME_MODES } from '../data/config/game-config';
import { AuthService } from './auth/auth-service';
import { LoginScreen } from './auth/LoginScreen';
import { CertificateScreen } from './certificate/CertificateScreen';
import { canTransitionScreen } from './core/state-manager';
import { GameplayScreen } from './game/GameplayScreen';
import { ResultScreen } from './game/ResultScreen';
import { HomeScreen } from './home/HomeScreen';
import { LeaderboardScreen } from './leaderboard/LeaderboardScreen';
import { ApiClient } from './services/api-client';
import { ScoreService } from './services/score-service';
import { SkinManager } from './skins/skin-manager';
import { SkinCollectionScreen } from './skins/SkinCollectionScreen';
import { TabBar } from './ui/TabBar';
import { soundFX } from './utils/sound';

const TAB_SCREENS = new Set(['MAIN_MENU', 'SKIN_COLLECTION', 'LEADERBOARD', 'CERTIFICATE']);

const validMode = (mode) => (GAME_MODES[mode] ? mode : 'BASIC');

export default function App() {
  // Đọc hồ sơ đã lưu một lần khi khởi động; có hồ sơ thì vào thẳng màn hình chính
  const [initial] = useState(() => {
    const savedProfile = AuthService.getCurrentProfile();
    const savedProgress = ScoreService.getPlayerProgress(savedProfile);
    return {
      profile: savedProfile,
      progress: savedProgress,
      skin: SkinManager.getEquippedSkin(savedProfile, savedProgress),
    };
  });
  const [screen, setScreen] = useState(initial.profile ? 'MAIN_MENU' : 'LOGIN');
  const [profile, setProfile] = useState(initial.profile);
  const [progress, setProgress] = useState(initial.progress);
  const [equippedSkin, setEquippedSkin] = useState(initial.skin);
  const [selectedMode, setSelectedMode] = useState(validMode(initial.progress.lastMode));
  const [autoStart, setAutoStart] = useState(false);
  const [lastRunSummary, setLastRunSummary] = useState(null);

  const navigateTo = useCallback(
    (target) => {
      if (!canTransitionScreen(screen, target)) return;
      if (soundFX.isBgmEnabled()) {
        soundFX.startBgm();
      }
      setScreen(target);
      window.scrollTo(0, 0);
    },
    [screen]
  );

  const handleTabNavigate = (target) => {
    soundFX.playClick();
    navigateTo(target);
  };

  const handleLoginSuccess = (loggedInProfile) => {
    setProfile(loggedInProfile);
    const loadedProgress = ScoreService.getPlayerProgress(loggedInProfile);
    const { updatedProgress } = SkinManager.evaluateAndUnlockSkins(
      loggedInProfile,
      loadedProgress
    );
    setProgress(updatedProgress);
    setEquippedSkin(SkinManager.getEquippedSkin(loggedInProfile, updatedProgress));
    setSelectedMode(validMode(updatedProgress.lastMode));
    navigateTo('MAIN_MENU');
  };

  const handleLogout = () => {
    soundFX.playClick();
    AuthService.logout();
    setProfile(null);
    navigateTo('LOGIN');
  };

  const startGame = (fromReplay) => {
    soundFX.playClick();
    setAutoStart(fromReplay);
    navigateTo('PLAYING');
  };

  const handleGameOver = async (runResult) => {
    const submission = await ApiClient.submitScore(profile, runResult);
    setProgress(submission.updatedProgress);
    setEquippedSkin(
      SkinManager.getEquippedSkin(profile, submission.updatedProgress)
    );
    setLastRunSummary({ run: runResult, submission });
    navigateTo('GAME_OVER');
  };

  const handleEquipSkin = async (skinId) => {
    const res = await ApiClient.saveEquippedSkin(profile, progress, skinId);
    if (res.success) {
      soundFX.playClick();
      setEquippedSkin(res.equippedSkin);
    }
  };

  const showTabBar = profile !== null && TAB_SCREENS.has(screen);

  return (
    <div className="min-h-dvh bg-paper text-text">
      {/* Màn hình đăng nhập: chỉ gồm Họ và tên + Lớp */}
      {screen === 'LOGIN' && <LoginScreen onLoginSuccess={handleLoginSuccess} />}

      {profile && (
        <main className={showTabBar ? 'pb-[calc(6rem+env(safe-area-inset-bottom))]' : ''}>
          {screen === 'MAIN_MENU' && (
            <HomeScreen
              profile={profile}
              progress={progress}
              equippedSkin={equippedSkin}
              selectedMode={selectedMode}
              onSelectMode={(modeId) => {
                soundFX.playClick();
                setSelectedMode(modeId);
              }}
              onPlay={() => startGame(false)}
              onOpenSkins={() => handleTabNavigate('SKIN_COLLECTION')}
              onLogout={handleLogout}
            />
          )}

          {screen === 'PLAYING' && (
            <GameplayScreen
              modeId={selectedMode}
              skin={equippedSkin}
              highScore={progress.highScore}
              autoStart={autoStart}
              onGameOver={handleGameOver}
              onExitToMenu={() => navigateTo('MAIN_MENU')}
            />
          )}

          {screen === 'GAME_OVER' && lastRunSummary && (
            <ResultScreen
              summary={lastRunSummary}
              equippedSkin={equippedSkin}
              onReplay={() => startGame(true)}
              onHome={() => handleTabNavigate('MAIN_MENU')}
              onEquipSkin={handleEquipSkin}
            />
          )}

          {screen === 'SKIN_COLLECTION' && (
            <SkinCollectionScreen
              profile={profile}
              progress={progress}
              equippedSkin={equippedSkin}
              onSkinEquipped={(newSkin) => setEquippedSkin(newSkin)}
              onProgressUpdated={(updatedProg) => setProgress(updatedProg)}
            />
          )}

          {screen === 'LEADERBOARD' && (
            <LeaderboardScreen profile={profile} equippedSkin={equippedSkin} />
          )}

          {screen === 'CERTIFICATE' && (
            <CertificateScreen
              profile={profile}
              progress={progress}
              equippedSkin={equippedSkin}
            />
          )}
        </main>
      )}

      {showTabBar && <TabBar current={screen} onNavigate={handleTabNavigate} />}
    </div>
  );
}
