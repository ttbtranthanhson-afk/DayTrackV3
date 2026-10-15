import { getAccountItem } from './accountStorage';

export interface UserProfile {
  job?: string;
  health?: string;
  mental?: string;
}

export function readUserProfile(): UserProfile | undefined {
  try {
    const raw = getAccountItem('daytrack_user_data');
    if (!raw) return undefined;
    const data = JSON.parse(raw) as UserProfile;
    if (!data.job && !data.health && !data.mental) return undefined;
    return { job: data.job, health: data.health, mental: data.mental };
  } catch {
    return undefined;
  }
}
