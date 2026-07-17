import { gameApi } from '@/api/game.api';
import { sportsApi } from '@/api/sports.api';
import { AnalyticsService, CasinoAnalyticsEvent } from '@/modules/analytics';

export const BetService = {
  async getCasinoBets(page = 1, perPage = 20) {
    const result = await gameApi.getBets(page, perPage);
    AnalyticsService.track(CasinoAnalyticsEvent.BetHistoryViewed, {
      tab: 'bets',
      page,
    });
    return result;
  },

  async getSportsBets(page = 1, perPage = 20) {
    const result = await sportsApi.getBets(page, perPage);
    AnalyticsService.track(CasinoAnalyticsEvent.BetHistoryViewed, {
      tab: 'sports_bets',
      page,
    });
    return result;
  },
};
