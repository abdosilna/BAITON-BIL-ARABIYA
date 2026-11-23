import { useEffect } from 'react';
import { AlertBanner, Button, LoadingSkeleton } from './components/ui/Primitives';
import { ToastContainer } from './components/ui/ToastContainer';
import { useRouter } from './hooks/useRouter';
import { AppLayout } from './layouts/AppLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { AchievementsPage } from './pages/AchievementsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AITutorPage } from './pages/AITutorPage';
import { ContentManagementPage } from './pages/ContentManagementPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { DashboardPage } from './pages/DashboardPage';
import { InteractiveExercisesPage } from './pages/InteractiveExercisesPage';
import { LandingPage } from './pages/LandingPage';
import { LearningPathsPage } from './pages/LearningPathsPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProgressStatsPage } from './pages/ProgressStatsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PythonPlaygroundPage } from './pages/PythonPlaygroundPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const { pathname, navigate } = useRouter();
  const isBootstrapping = useAppStore((s) => s.isBootstrapping);
  const initError = useAppStore((s) => s.initError);
  const bootstrap = useAppStore((s) => s.bootstrap);
  const profile = useAppStore((s) => s.profile);
  const enterDemo = useAppStore((s) => s.enterDemo);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!isBootstrapping && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' && !profile) {
        void enterDemo('learner').then(() => {
          if (pathname === '/' || pathname === '/login') {
            navigate('/dashboard');
          }
        });
      }
    }
  }, [isBootstrapping, profile, enterDemo, pathname, navigate]);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-[#101018] p-6 sm:p-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-[#181826]" />
          <LoadingSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-[#101018] flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-4">
          <AlertBanner
            tone="error"
            title="تعذر تحميل مساحة العمل المحلية"
            description={initError}
            action={<Button onClick={() => void bootstrap()}>إعادة المحاولة</Button>}
          />
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (pathname === '/' || pathname === '') {
      return (
        <PublicLayout onNavigate={navigate} hasSession={Boolean(profile)}>
          <LandingPage onNavigate={navigate} />
        </PublicLayout>
      );
    }

    if (pathname === '/login') {
      return (
        <PublicLayout onNavigate={navigate} hasSession={Boolean(profile)}>
          <LoginPage onNavigate={navigate} />
        </PublicLayout>
      );
    }

    if (pathname === '/dashboard') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="لوحة التعلم">
          <DashboardPage onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/paths') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="المسارات التعليمية">
          <LearningPathsPage onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname.startsWith('/paths/')) {
      const courseId = pathname.replace('/paths/', '').split('/')[0];
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="تفاصيل المسار">
          <CourseDetailsPage courseId={courseId} onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname.startsWith('/lesson/')) {
      const lessonId = pathname.replace('/lesson/', '').split('/')[0];
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="مشغل الدرس التفاعلي">
          <LessonPlayerPage lessonId={lessonId} onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/exercises') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="التمارين التفاعلية">
          <InteractiveExercisesPage />
        </AppLayout>
      );
    }

    if (pathname === '/playground') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="Python Playground">
          <PythonPlaygroundPage />
        </AppLayout>
      );
    }

    if (pathname === '/ai-tutor') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="المعلم الذكي">
          <AITutorPage />
        </AppLayout>
      );
    }

    if (pathname === '/projects') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="المشاريع العملية">
          <ProjectsPage />
        </AppLayout>
      );
    }

    if (pathname === '/achievements') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="الإنجازات والأوسمة">
          <AchievementsPage />
        </AppLayout>
      );
    }

    if (pathname === '/stats') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="إحصائيات التقدم">
          <ProgressStatsPage onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/profile') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="الملف الشخصي">
          <ProfilePage onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/settings') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="الإعدادات">
          <SettingsPage />
        </AppLayout>
      );
    }

    if (pathname === '/admin') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="لوحة الإدارة التجريبية">
          <AdminDashboardPage onNavigate={navigate} />
        </AppLayout>
      );
    }

    if (pathname === '/admin/content') {
      return (
        <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="إدارة المحتوى">
          <ContentManagementPage />
        </AppLayout>
      );
    }

    return (
      <AppLayout currentPath={pathname} onNavigate={navigate} pageTitle="صفحة غير موجودة">
        <div className="py-16 text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">الصفحة غير موجودة</h2>
          <p className="text-sm text-[#A1A1B5]">
            الرابط المطلوب غير متاح داخل المنصة.
          </p>
          <Button onClick={() => navigate('/dashboard')}>العودة للوحة التعلم</Button>
        </div>
      </AppLayout>
    );
  };

  return (
    <>
      {renderPage()}
      <ToastContainer />
    </>
  );
}
