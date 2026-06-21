import * as React from 'react';
import { StopCard } from './StopCard';
import type { StopStats, BusStop } from '../../../types';
import { stops as allStops } from '../../../data';
import { useBusCheckStore } from '../../../store';
import { Inbox } from 'lucide-react';

interface StopListProps {
  stopStats: StopStats[];
  onStopClick?: (stop: BusStop) => void;
}

export const StopList: React.FC<StopListProps> = ({ stopStats, onStopClick }) => {
  const { filterConditions } = useBusCheckStore();

  if (stopStats.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
        <Inbox className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">暂无站点数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-700">站点明细</h3>
          <span className="text-xs text-slate-400">（点击卡片查看学生）</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            正常
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            关注
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            警告
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            严重
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {stopStats
          .sort((a, b) => a.stopOrder - b.stopOrder)
          .map((stats, idx) => {
            const stop = allStops.find((s: BusStop) => s.id === stats.stopId);
            return (
              <StopCard
                key={stats.stopId}
                stats={stats}
                index={idx}
                address={stop?.address || ''}
                onClick={() => stop && onStopClick?.(stop)}
              />
            );
          })}
      </div>
    </div>
  );
};

StopList.displayName = 'StopList';
