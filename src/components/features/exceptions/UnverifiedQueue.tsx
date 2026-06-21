import * as React from 'react';
import type { StudentRideStatus } from '../../../utils/stats';
import { getEffectiveStatusLabel } from '../../../utils/stats';
import type { Student, BusStop, ShiftType, BusRoute } from '../../../types';
import { User, MapPin, AlertTriangle, ShieldCheck, UserX, Clock } from 'lucide-react';
import { Button, StatusBadge } from '../../common';
import { clsx } from 'clsx';
import { stops as allStops, routes as allRoutes } from '../../../data';

interface UnverifiedQueueProps {
  students: StudentRideStatus[];
  currentShift: ShiftType;
  currentDate: string;
  onManualBoard: (student: Student) => void;
  onMarkMissing: (student: Student, routeId: string) => void;
}

export const UnverifiedQueue: React.FC<UnverifiedQueueProps> = ({
  students,
  currentShift,
  currentDate,
  onManualBoard,
  onMarkMissing,
}) => {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
        </div>
        <p className="mt-3 text-sm font-semibold text-emerald-800">太棒了！当前班次全部核验完成</p>
        <p className="mt-1 text-xs text-emerald-700/70">
          所有学生都已正常刷卡或人工确认上车
        </p>
      </div>
    );
  }

  const groupedByStop = React.useMemo(() => {
    const groups: { [stopId: string]: StudentRideStatus[] } = {};
    students.forEach((s) => {
      const stopId = s.student.assignedStopId;
      if (!groups[stopId]) groups[stopId] = [];
      groups[stopId].push(s);
    });
    return Object.entries(groups).sort((a, b) => {
      const stopA = allStops.find((s) => s.id === a[0]);
      const stopB = allStops.find((s) => s.id === b[0]);
      return (stopA?.order || 0) - (stopB?.order || 0);
    });
  }, [students]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-700">待核验队列</h3>
            <p className="text-xs text-slate-500">
              未刷卡学生列表，可直接人工确认上车或标记为未乘车
            </p>
          </div>
        </div>
        <StatusBadge variant="danger" size="md">
          待处理 {students.length} 人
        </StatusBadge>
      </div>

      <div className="space-y-5">
        {groupedByStop.map(([stopId, list]) => {
          const stop = allStops.find((s) => s.id === stopId);
          const route: BusRoute | undefined = allRoutes.find((r) => r.id === list[0]?.student.routeId);
          return (
            <div
              key={stopId}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">{stop?.name}</span>
                  <span className="text-xs text-slate-400">· {stop?.address}</span>
                </div>
                <StatusBadge variant="danger" size="sm">
                  {list.length} 人待核验
                </StatusBadge>
              </div>

              <div className="divide-y divide-slate-100">
                {list.map((item, idx) => (
                  <div
                    key={item.student.id}
                    className="group flex items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50/60"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                        <User className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800">
                            {item.student.name}
                          </span>
                          <StatusBadge variant="danger" size="sm" dot>
                            {getEffectiveStatusLabel(item.effectiveStatus)}
                          </StatusBadge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.student.className} · 学号 {item.student.studentNo}
                        </p>
                        {route && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="h-3 w-3" />
                            {currentDate} · {currentShift === 'morning' ? '早班' : '晚班'} ·{' '}
                            {route.plateNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<UserX className="h-3.5 w-3.5" />}
                        onClick={() => onMarkMissing(item.student, item.student.routeId)}
                      >
                        未乘车
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<ShieldCheck className="h-3.5 w-3.5" />}
                        onClick={() => onManualBoard(item.student)}
                      >
                        人工确认上车
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

UnverifiedQueue.displayName = 'UnverifiedQueue';
