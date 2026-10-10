const ALLOWED_TRANSITIONS = {
  LOGIN: ['MAIN_MENU'],
  MAIN_MENU: [
    'PLAYING',
    'SKIN_COLLECTION',
    'LEADERBOARD',
    'CERTIFICATE',
    'LOGIN',
  ],
  PLAYING: ['GAME_OVER', 'MAIN_MENU'],
  GAME_OVER: ['PLAYING', 'MAIN_MENU'],
  SKIN_COLLECTION: ['MAIN_MENU', 'LEADERBOARD', 'CERTIFICATE'],
  LEADERBOARD: ['MAIN_MENU', 'SKIN_COLLECTION', 'CERTIFICATE'],
  CERTIFICATE: ['MAIN_MENU', 'SKIN_COLLECTION', 'LEADERBOARD'],
};

export function canTransitionScreen(from, to) {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
