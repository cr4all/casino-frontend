import { useEffect, useRef, useState } from 'react';
import { subscribePlayerVipLevel } from '@/api/playerLevelRealtime';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { refreshEchoToken } from '@/lib/echo';
import { usePlayerStore } from '@/stores/playerStore';

export interface LevelUpNotice {
  levelName: string;
  levelSlug: string;
}

export function usePlayerLevelSync() {
  const enabled = usePlayerSession().enabled;
  const profile = usePlayerStore((s) => s.profile);
  const setProfile = usePlayerStore((s) => s.setProfile);
  const fetchProfile = usePlayerStore((s) => s.fetchProfile);
  const [levelUpNotice, setLevelUpNotice] = useState<LevelUpNotice | null>(null);
  const knownLevelRef = useRef<number | null>(null);

  const playerId = profile?.id ?? null;

  const handleLevelIncrease = (level: number, levelName: string, levelSlug: string) => {
    const previous = knownLevelRef.current;
    knownLevelRef.current = level;

    if (previous !== null && level > previous) {
      setLevelUpNotice({ levelName, levelSlug });
    }
  };

  useEffect(() => {
    if (!enabled || profile == null) {
      knownLevelRef.current = null;
      return;
    }

    if (knownLevelRef.current === null && profile.vip_level != null) {
      knownLevelRef.current = profile.vip_level;
    }
  }, [enabled, profile]);

  useEffect(() => {
    if (!enabled || playerId == null) {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    unsubscribe = subscribePlayerVipLevel({
      playerId,
      onLevelUpdate: (update) => {
        if (cancelled) return;

        handleLevelIncrease(update.vip_level, update.vip_level_name, update.vip_level_slug);
        setProfile({
          vip_level: update.vip_level,
          vip_level_name: update.vip_level_name,
          vip_level_slug: update.vip_level_slug,
        });
      },
      onError: () => undefined,
    });

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      refreshEchoToken();
      void fetchProfile(true).then((updated) => {
        if (!updated || updated.vip_level == null) return;
        handleLevelIncrease(
          updated.vip_level,
          updated.vip_level_name ?? 'Regular',
          updated.vip_level_slug ?? 'regular',
        );
      });
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      unsubscribe?.();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, playerId, setProfile, fetchProfile]);

  const dismissLevelUpNotice = () => setLevelUpNotice(null);

  return { levelUpNotice, dismissLevelUpNotice };
}
