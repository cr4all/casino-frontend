import { gameApi } from '@/api/game.api';
import { AnalyticsService, CasinoAnalyticsEvent } from '@/modules/analytics';
import { openGameWindow as openGameWindowUtil } from '@/utils/openGameWindow';

export const GameService = {
  getGame: gameApi.getGame,
  getGames: gameApi.getGames,
  getVendors: gameApi.getVendors,

  openGameWindow(gameId: number): boolean {
    AnalyticsService.track(CasinoAnalyticsEvent.GameLaunchClicked, { game_id: gameId });
    return openGameWindowUtil(gameId);
  },

  async launch(gameId: number) {
    const result = await gameApi.launch(gameId);
    AnalyticsService.track(CasinoAnalyticsEvent.GameLaunched, { game_id: gameId });
    return result;
  },
};
