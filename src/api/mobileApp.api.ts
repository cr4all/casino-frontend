import api from '@/api/axios';
import type { ApiResponse } from '@/types';

export interface MobileAppRelease {
  version: string | null;
  download_url: string | null;
}

export async function fetchMobileAppRelease(): Promise<MobileAppRelease | null> {
  try {
    const { data } = await api.get<ApiResponse<MobileAppRelease>>('/mobile-app/version');
    return data.data ?? null;
  } catch {
    return null;
  }
}
