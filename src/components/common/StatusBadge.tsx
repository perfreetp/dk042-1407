import * as React from 'react';
import { clsx } from 'clsx';

export interface StatusBadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'amber' | 'orange';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<NonNullable<StatusBadgeProps['variant']>, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
};

const dotColors: Record<NonNullable<StatusBadgeProps['variant']>, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  default: 'bg-slate-400',
  amber: 'bg-amber-500',
  orange: 'bg-orange-500',
};

const sizeClasses: Record<NonNullable<StatusBadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  dot = false,
  className,
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};

StatusBadge.displayName = 'StatusBadge';

export interface RiskBadgeProps {
  level: 'normal' | 'attention' | 'warning' | 'critical';
  showLabel?: boolean;
}

const riskConfig = {
  normal: { label: '正常', variant: 'success' as const },
  attention: { label: '关注', variant: 'amber' as const },
  warning: { label: '警告', variant: 'orange' as const },
  critical: { label: '严重', variant: 'danger' as const },
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showLabel = true }) => {
  const config = riskConfig[level];
  return (
    <StatusBadge variant={config.variant} dot size="md">
      {showLabel && config.label}
    </StatusBadge>
  );
};

RiskBadge.displayName = 'RiskBadge';
