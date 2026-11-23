import type { Profile, UserRole } from '../../types/database';
import type { AuthAdapter, AuthSession } from './AuthAdapter';

/**
 * Placeholder adapter for future Supabase Auth integration.
 * Intentionally unconfigured in Phase 1 (Local Demo Mode).
 * Do not add hardcoded URLs or keys here; inject via server/runtime config in Phase 2.
 */
export class SupabaseAuthAdapterPlaceholder implements AuthAdapter {
  readonly isProductionReady = false;
  readonly providerLabel = 'Supabase Auth (Not Connected)';

  async getCurrentSession(): Promise<AuthSession | null> {
    throw new Error('Supabase Auth غير مربوط في هذه النسخة. استخدم Local Demo Mode.');
  }

  async enterDemoAccount(_role: UserRole, _customDisplayName?: string): Promise<{ session: AuthSession; profile: Profile }> {
    throw new Error('Supabase Auth غير مربوط بعد.');
  }

  async switchDemoRole(_role: UserRole): Promise<{ session: AuthSession; profile: Profile }> {
    throw new Error('Supabase Auth غير مربوط بعد.');
  }

  async signOut(): Promise<void> {
    throw new Error('Supabase Auth غير مربوط بعد.');
  }
}
