import * as React from 'react';
import { MapPin, Users, UserCheck, UserX, LogOut, Clock, ChevronRight, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import type { StopStats } from '../../../types';
import { getRiskColor, getRiskLabel } from '../../../utils/stats';
import { RiskBadge } from '../../common';

interface StopCardProps {
  stats: StopStats;
  index: number;
  address: string;
  onClick?: () => void;
}

export const StopCard: React.FC<StopCardProps> = ({ stats, index, address, onClick }) => {
  const riskColor = getRiskColor(stats.riskLevel);
  const isLast = stats.completionRate >= 100;

  return (
    <div
      onClick={onClick}
      className={clsx(
        'group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5',
        riskColor.border
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={clsx('absolute left-0 inset-y-0 w-1.5', riskColor.solid)} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={clsx(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-lg shadow-inner',
                riskColor.bg,
                riskColor.text
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="truncate text-base font-semibold text-slate-800 group-hover:text-slate-900">
                  {stats.stopName}
                </h4>
                <RiskBadge level={stats.riskLevel} />
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{address}</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors">
            <Eye className="h-3.5 w-3.5" />
            <span>查看明细</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-500">
              <Users className="h-3.5 w-3.5" />
              <span className="text-[11px]">应上车</span>
            </div>
            <p className="mt-1 font-mono text-xl font-bold text-slate-800">
              {stats.totalExpected}
            </p>
          </div>

          <div className="rounded-lg bg-emerald-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600">
              <UserCheck className="h-3.5 w-3.5" />
              <span className="text-[11px]">已刷上车</span>
            </div>
            <p className="mt-1 font-mono text-xl font-bold text-emerald-700">
              {stats.boarded}
            </p>
            {stats.manualBoarded > 0 && (
              <p className="mt-0.5 text-[10px] text-amber-600">人工{stats.manualBoarded}</p>
            )}
          </div>

          <div
            className={clsx(
              'rounded-lg p-3 text-center',
              stats.notBoarded === 0 ? 'bg-slate-50' : 'bg-red-50'
            )}
          >
            <div
              className={clsx(
                'flex items-center justify-center gap-1',
                stats.notBoarded === 0 ? 'text-slate-500' : 'text-red-600'
              )}
            >
              <UserX className="h-3.5 w-3.5" />
              <span className="text-[11px]">未刷卡</span>
            </div>
            <p
              className={clsx(
                'mt-1 font-mono text-xl font-bold',
                stats.notBoarded === 0 ? 'text-slate-700' : 'text-red-700'
              )}
            >
              {stats.notBoarded}
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-[11px]">已下车</span>
            </div>
            <p className="mt-1 font-mono text-xl font-bold text-blue-700">
              {stats.alighted}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="h-3 w-3" />
              <span>站点完成进度</span>
            </div>
            <span
              className={clsx(
                'font-mono font-semibold',
                isLast ? 'text-emerald-600' : 'text-slate-700'
              )}
            >
              {stats.completionRate}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-700 ease-out',
                isLast
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-400 to-blue-500'
              )}
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

StopCard.displayName = 'StopCard';
