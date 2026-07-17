import { sportsApi, type SportsIframeMode } from '@/api/sports.api';
import { AnalyticsService, CasinoAnalyticsEvent } from '@/modules/analytics';

export const SportsService = {
  getBets: sportsApi.getBets,

  async launch(
    mode: SportsIframeMode,
    options?: { oddFormat?: string; language?: string },
  ) {
    const result = await sportsApi.launch(mode, options);
    AnalyticsService.track(CasinoAnalyticsEvent.SportsLaunched, {
      mode,
      language: options?.language,
    });
    return result;
  },
};
