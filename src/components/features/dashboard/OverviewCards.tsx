import * as React from 'react';
import { Users, CheckCircle2, AlertTriangle, LogOut, AlertOctagon, TrendingUp } from 'lucide-react';
import { StatCard } from '../../common';
import type { DashboardOverview } from '../../../types';

interface OverviewCardsProps {
  overview: DashboardOverview;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="总学生数"
        value={overview.totalStudents}
        icon={<Users className="h-6 w-6" />}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        accentColor="info"
      />
      <StatCard
        title="已上车"
        value={overview.totalBoarded}
        icon={<CheckCircle2 className="h-6 w-6" />}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        accentColor="success"
      />
      <StatCard
        title="未刷卡"
        value={overview.totalNotBoarded}
        icon={<AlertTriangle className="h-6 w-6" />}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        accentColor="warning"
      />
      <StatCard
        title="已下车"
        value={overview.totalAlighted}
        icon={<LogOut className="h-6 w-6" />}
        iconBg="bg-slate-100"
        iconColor="text-slate-600"
        accentColor="primary"
      />
      <StatCard
        title="异常登记"
        value={overview.totalExceptions}
        icon={<AlertOctagon className="h-6 w-6" />}
        iconBg="bg-red-100"
        iconColor="text-red-600"
        accentColor="danger"
      />
    </div>
  );
};

interface ProgressBarProps {
  completionRate: number;
}

export const OverallProgress: React.FC<ProgressBarProps> = ({ completionRate }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-semibold text-slate-700">乘车完成进度</h3>
        </div>
        <span className="font-mono text-2xl font-bold text-emerald-600">{completionRate}%</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 transition-all duration-700 ease-out"
          style={{ width: `${completionRate}%` }}
        >
          <div className="absolute inset-0 animate-pulse bg-white/20" />
        </div>
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{
            width: `${Math.min(completionRate, 100)}%`,
            animation: completionRate > 5 ? 'shimmer 2s infinite' : 'none',
          }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

OverviewCards.displayName = 'OverviewCards';
OverallProgress.displayName = 'OverallProgress';
