import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  Bot,
  BookOpen,
  Code2,
  FolderGit2,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Terminal,
  User,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getLevelProgress } from '../utils/gamification';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (to: string) => void;
  pageTitle: string;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { to: '/dashboard', label: 'لوحة التعلم', icon: LayoutDashboard },
  { to: '/paths', label: 'المسارات التعليمية', icon: Layers },
  { to: '/exercises', label: 'التمارين التفاعلية', icon: Code2 },
  { to: '/playground', label: 'محرر Python', icon: Terminal },
  { to: '/ai-tutor', label: 'المعلم الذكي', icon: Bot },
  { to: '/projects', label: 'المشاريع العملية', icon: FolderGit2 },
];

const SECONDARY_NAV: NavItem[] = [
  { to: '/achievements', label: 'الإنجازات والأوسمة', icon: Award },
  { to: '/stats', label: 'إحصائيات التقدم', icon: BarChart3 },
  { to: '/profile', label: 'الملف الشخصي', icon: User },
  { to: '/settings', label: 'الإعدادات', icon: Settings },
  { to: '/admin', label: 'لوحة الإدارة التجريبية', icon: ShieldCheck },
  { to: '/admin/content', label: 'إدارة المحتوى', icon: BookOpen },
];

export function AppLayout({ children, currentPath, onNavigate, pageTitle }: AppLayoutProps) {
  const profile = useAppStore((s) => s.profile);
  const signOut = useAppStore((s) => s.signOut);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const levelInfo = getLevelProgress(profile?.xp ?? 0);

  const isActive = (to: string) => {
    if (to === '/admin') return currentPath === '/admin';
    if (to === '/paths') return currentPath === '/paths' || currentPath.startsWith('/paths/');
    return currentPath === to;
  };

  const handleNavClick = (to: string) => {
    setMobileMenuOpen(false);
    onNavigate(to);
  };

  return (
    <div className="min-h-screen bg-[#101018] text-[#F4F4F8] flex flex-col lg:flex-row">
      {/* Desktop Sidebar (RTL right side) */}
      <aside className="hidden lg:flex lg:w-[264px] lg:shrink-0 lg:flex-col border-l border-white/[0.08] bg-[#141420] sticky top-0 h-screen">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('/');
            }}
            className="text-base font-bold text-white whitespace-nowrap"
          >
            بايتون بالعربية
          </a>
        </div>

        {profile && (
          <div className="border-b border-white/[0.08] px-5 py-4">
            <div className="flex items-center justify-between text-xs text-[#A1A1B5]">
              <span className="font-medium text-[#F4F4F8] truncate">{profile.displayName}</span>
              <span className="font-mono tabular-nums text-[#F59E0B]">
                Lv.{levelInfo.level}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#272338]">
              <div
                className="h-full rounded-full bg-[#8B5CF6]"
                style={{ width: `${levelInfo.percent}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#A1A1B5] tabular-nums">
              <span>{profile.xp} XP</span>
              <span>{profile.streakDays} يوم متواصل</span>
            </div>
          </div>
        )}

        <nav aria-label="القائمة الجانبية" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-1">
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.to);
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#272338] text-white font-semibold'
                      : 'text-[#A1A1B5] hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#8B5CF6]' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </a>
              );
            })}
          </div>

          <div className="border-t border-white/[0.08] pt-4 space-y-1">
            {SECONDARY_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.to);
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#272338] text-white font-semibold'
                      : 'text-[#A1A1B5] hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#8B5CF6]' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </a>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/[0.08] p-3">
          {profile ? (
            <button
              type="button"
              onClick={async () => {
                await signOut();
                onNavigate('/login');
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#A1A1B5] hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>تبديل الحساب التجريبي</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="flex w-full items-center justify-center rounded-lg bg-[#8B5CF6] px-3 py-2 text-sm font-medium text-white hover:bg-[#7C3AED]"
            >
              دخول التجربة
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Compact Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/[0.08] bg-[#101018]/95 backdrop-blur-md px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/');
              }}
              aria-label="العودة للرئيسية"
              className="lg:hidden rounded-lg p-1.5 text-[#A1A1B5] hover:bg-white/5 hover:text-white"
            >
              <Home className="h-5 w-5" />
            </a>
            <h1 className="text-base sm:text-lg font-semibold text-white truncate">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {profile ? (
              <button
                type="button"
                onClick={() => handleNavClick('/profile')}
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#181826] px-3 py-1.5 text-xs text-[#F4F4F8] hover:bg-[#272338] whitespace-nowrap"
              >
                <span>{profile.displayName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-[#F59E0B]">{profile.xp} XP</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('/login')}
                className="rounded-lg bg-[#8B5CF6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#7C3AED] whitespace-nowrap"
              >
                دخول التجربة
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="فتح قائمة التنقل"
              className="lg:hidden rounded-lg border border-white/10 bg-[#181826] p-2 text-[#F4F4F8]"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (compact <= 60px) */}
      <nav
        aria-label="التنقل السفلي للهاتف"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-around border-t border-white/[0.08] bg-[#141420]/95 backdrop-blur-md px-2 py-1.5 h-14"
      >
        {[
          { to: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
          { to: '/paths', label: 'المسارات', icon: Layers },
          { to: '/playground', label: 'المحرر', icon: Terminal },
          { to: '/ai-tutor', label: 'المعلم', icon: Bot },
        ].map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <button
              key={item.to}
              type="button"
              onClick={() => handleNavClick(item.to)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[11px] min-w-[56px] ${
                active ? 'text-[#8B5CF6] font-semibold' : 'text-[#A1A1B5]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[11px] min-w-[56px] text-[#A1A1B5]"
        >
          <Menu className="h-4 w-4" />
          <span>المزيد</span>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة الصفحات"
        >
          <div className="w-72 max-w-[85vw] bg-[#141420] border-r border-white/10 h-full overflow-y-auto p-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="font-bold text-white">بايتون بالعربية</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="إغلاق القائمة"
                className="rounded-lg p-1.5 text-[#A1A1B5] hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1 flex-1">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => handleNavClick(item.to)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                      active ? 'bg-[#272338] text-white font-semibold' : 'text-[#A1A1B5]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
