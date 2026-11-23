import type { Profile, UserRole } from '../../types/database';
import { getTodayIsoDate } from '../../utils/gamification';
import type { DatabaseAdapter } from '../database/DatabaseAdapter';
import type { StorageAdapter } from '../storage/StorageAdapter';
import type { AuthAdapter, AuthSession } from './AuthAdapter';

const ACTIVE_USER_KEY = 'active_demo_user_id';
const DEMO_LEARNER_ID = 'demo-learner-01';
const DEMO_ADMIN_ID = 'demo-admin-01';

const DEMO_DISCLAIMER_AR =
  'وضع التجربة المحلي (Local Demo Mode): هذا الدخول محاكاة محلية محفوظة في متصفحك بدون كلمة مرور حقيقية أو خادم مصادقة إنتاجي.';

export class LocalAuthAdapter implements AuthAdapter {
  readonly isProductionReady = false;
  readonly providerLabel = 'Local Demo Auth (Simulated)';

  constructor(
    private db: DatabaseAdapter,
    private storage: StorageAdapter
  ) {}

  private buildDefaultProfile(userId: string, role: UserRole, customName?: string): Profile {
    const today = getTodayIsoDate();
    if (role === 'admin') {
      return {
        id: userId,
        username: 'demo_admin',
        displayName: customName?.trim() || 'مشرف المنصة التجريبي',
        bio: 'حساب إدارة تجريبي محلي لاختبار إدارة المحتوى والمسارات.',
        role: 'admin',
        xp: 420,
        level: 3,
        streakDays: 2,
        lastActiveDate: today,
        dailyGoalXp: 100,
        isDemoAccount: true,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: userId,
      username: 'demo_learner',
      displayName: customName?.trim() || 'متعلم بايتون',
      bio: 'رحلة تعلم Python من الأساسيات حتى بناء المشاريع العملية.',
      role: 'learner',
      xp: 0,
      level: 1,
      streakDays: 1,
      lastActiveDate: today,
      dailyGoalXp: 80,
      isDemoAccount: true,
      createdAt: new Date().toISOString(),
    };
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const activeUserId = this.storage.getItem<string | null>(ACTIVE_USER_KEY, null);
    if (!activeUserId) return null;
    const profile = await this.db.getProfile(activeUserId);
    if (!profile) return null;
    return {
      userId: profile.id,
      role: profile.role,
      isDemoMode: true,
      providerName: this.providerLabel,
      disclaimerAr: DEMO_DISCLAIMER_AR,
    };
  }

  async enterDemoAccount(
    role: UserRole,
    customDisplayName?: string
  ): Promise<{ session: AuthSession; profile: Profile }> {
    const userId = role === 'admin' ? DEMO_ADMIN_ID : DEMO_LEARNER_ID;
    let profile = await this.db.getProfile(userId);
    if (!profile) {
      profile = this.buildDefaultProfile(userId, role, customDisplayName);
      await this.db.saveProfile(profile);
    } else if (customDisplayName && customDisplayName.trim().length >= 2) {
      profile = { ...profile, displayName: customDisplayName.trim() };
      await this.db.saveProfile(profile);
    }

    this.storage.setItem(ACTIVE_USER_KEY, profile.id);
    return {
      session: {
        userId: profile.id,
        role: profile.role,
        isDemoMode: true,
        providerName: this.providerLabel,
        disclaimerAr: DEMO_DISCLAIMER_AR,
      },
      profile,
    };
  }

  async switchDemoRole(role: UserRole): Promise<{ session: AuthSession; profile: Profile }> {
    return this.enterDemoAccount(role);
  }

  async signOut(): Promise<void> {
    this.storage.removeItem(ACTIVE_USER_KEY);
  }
}
