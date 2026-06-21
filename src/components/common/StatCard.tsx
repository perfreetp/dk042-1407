import * as React from 'react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
    color?: string;
  };
  accentColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const accentClasses = {
  primary: 'from-slate-50 to-slate-100',
  success: 'from-emerald-50 to-emerald-100',
  warning: 'from-amber-50 to-amber-100',
  danger: 'from-red-50 to-red-100',
  info: 'from-blue-50 to-blue-100',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBg = 'bg-slate-100',
  iconColor = 'text-slate-600',
  accentColor = 'primary',
  className,
}) => {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm',
        'transition-all duration-300 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div
        className={clsx(
          'absolute inset-0 opacity-40 bg-gradient-to-br',
          accentClasses[accentColor]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold font-mono tracking-tight text-slate-800">
            {value}
          </p>
        </div>
        <div
          className={clsx(
            'flex h-12 w-12 items-center justify-center rounded-xl shadow-inner',
            iconBg,
            iconColor
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

StatCard.displayName = 'StatCard';
