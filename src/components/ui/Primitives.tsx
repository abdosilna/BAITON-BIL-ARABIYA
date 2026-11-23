import React from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B5CF6] whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]',
    secondary:
      'bg-[#272338] text-[#F4F4F8] border border-white/10 hover:bg-[#322D47]',
    ghost: 'bg-transparent text-[#A1A1B5] hover:text-white hover:bg-white/5',
    success: 'bg-[#22C55E] text-[#081C0E] hover:bg-[#16A34A] font-semibold',
    danger: 'bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[42px]',
    lg: 'px-6 py-3 text-base min-h-[46px]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-[#181826] border border-white/[0.08] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function ProgressBar({
  value,
  color = 'primary',
  label,
}: {
  value: number;
  color?: 'primary' | 'success' | 'gold';
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  const fillColor =
    color === 'success'
      ? 'bg-[#22C55E]'
      : color === 'gold'
        ? 'bg-[#F59E0B]'
        : 'bg-[#8B5CF6]';

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-[#A1A1B5]">
          <span>{label}</span>
          <span className="font-mono tabular-nums text-[#F4F4F8]">{clamped}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[#272338]"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${fillColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function AlertBanner({
  tone = 'info',
  title,
  description,
  action,
}: {
  tone?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const styles = {
    info: 'bg-[#272338]/70 border-[#8B5CF6]/30 text-[#E2DCF9]',
    success: 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#BBF7D0]',
    warning: 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#FDE68A]',
    error: 'bg-red-500/10 border-red-500/30 text-red-200',
  }[tone];

  const Icon =
    tone === 'success'
      ? CheckCircle2
      : tone === 'warning' || tone === 'error'
        ? AlertCircle
        : Info;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${styles}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {description && <p className="mt-1 text-xs opacity-90 leading-relaxed">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#181826]/60 px-6 py-12 text-center">
      <p className="text-base font-semibold text-[#F4F4F8]">{title}</p>
      <p className="mt-2 max-w-md text-sm text-[#A1A1B5] leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="جاري التحميل">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-24 w-full animate-pulse rounded-xl bg-[#181826] border border-white/[0.06]"
        />
      ))}
    </div>
  );
}

export function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0D0D14]">
      {title && (
        <div className="flex items-center justify-between border-b border-white/10 bg-[#181826] px-4 py-2 text-xs text-[#A1A1B5]">
          <span>{title}</span>
          <span className="font-mono">Python 3</span>
        </div>
      )}
      <pre className="code-ltr overflow-x-auto p-4 text-sm leading-relaxed text-[#E4E4F0] font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}
