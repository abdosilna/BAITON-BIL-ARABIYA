import type { Profile, UserRole } from '../../types/database';

export interface AuthSession {
  userId: string;
  role: UserRole;
  isDemoMode: boolean;
  providerName: string;
  disclaimerAr: string;
}

export interface AuthAdapter {
  readonly isProductionReady: boolean;
  readonly providerLabel: string;
  getCurrentSession(): Promise<AuthSession | null>;
  enterDemoAccount(role: UserRole, customDisplayName?: string): Promise<{ session: AuthSession; profile: Profile }>;
  switchDemoRole(role: UserRole): Promise<{ session: AuthSession; profile: Profile }>;
  signOut(): Promise<void>;
}
