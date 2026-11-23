import React from 'react';
import { Button } from '../components/ui/Primitives';

interface PublicLayoutProps {
  children: React.ReactNode;
  onNavigate: (to: string) => void;
  hasSession: boolean;
}

export function PublicLayout({ children, onNavigate, hasSession }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[#101018] text-[#F4F4F8] flex flex-col">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#101018]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            بايتون بالعربية
          </a>

          <nav
            aria-label="التنقل الرئيسي"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#A1A1B5]"
          >
            <a
              href="/paths"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/paths');
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              المسارات
            </a>
            <a
              href="/playground"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/playground');
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              المحرر التفاعلي
            </a>
            <a
              href="/projects"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/projects');
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              المشاريع
            </a>
            <a
              href="/ai-tutor"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/ai-tutor');
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              المعلم الذكي
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <Button
              size="sm"
              onClick={() => onNavigate(hasSession ? '/dashboard' : '/login')}
            >
              {hasSession ? 'لوحة التعلم' : 'دخول التجربة'}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/[0.08] bg-[#101018] py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 text-xs text-[#A1A1B5]">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#F4F4F8]">بايتون بالعربية</span>
            <span aria-hidden="true">·</span>
            <span>BAITON BIL ARABIYA</span>
            <span aria-hidden="true">·</span>
            <span>وضع التجربة المحلي (Local Demo Mode)</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="/paths"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/paths');
              }}
              className="hover:text-white transition-colors"
            >
              المنهج التعليمي
            </a>
            <a
              href="/playground"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/playground');
              }}
              className="hover:text-white transition-colors"
            >
              Python Playground
            </a>
            <a
              href="/settings"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/settings');
              }}
              className="hover:text-white transition-colors"
            >
              الإعدادات
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
