import * as React from 'react';
import type { StudentRideStatus } from '../../../utils/stats';
import { getEffectiveStatusLabel } from '../../../utils/stats';
import type { Student, BusStop, ShiftType, BusRoute } from '../../../types';
import {
  User,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  UserX,
  Clock,
  CheckSquare,
  Square,
  CheckCircle2,
} from 'lucide-react';
import { Button, StatusBadge } from '../../common';
import { clsx } from 'clsx';
import { stops as allStops, routes as allRoutes } from '../../../data';

interface UnverifiedQueueProps {
  students: StudentRideStatus[];
  currentShift: ShiftType;
  currentDate: string;
  onManualBoard: (student: Student) => void;
  onMarkMissing: (student: Student, routeId: string) => void;
  onBatchManualBoard?: (studentIds: string[]) => number;
  onBatchMarkMissing?: (studentIds: string[]) => number;
}

type ToastType = 'success' | 'warning' | 'info';
interface ToastState {
  message: string;
  type: ToastType;
}

export const UnverifiedQueue: React.FC<UnverifiedQueueProps> = ({
  students,
  currentShift,
  currentDate,
  onManualBoard,
  onMarkMissing,
  onBatchManualBoard,
  onBatchMarkMissing,
}) => {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<ToastState | null>(null);

  React.useEffect(() => {
    setSelected(new Set());
  }, [students.length, currentShift, currentDate]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const toggleSelect = (studentId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const selectAllInStop = (list: StudentRideStatus[], shouldSelect: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      list.forEach((s) => {
        if (shouldSelect) next.add(s.student.id);
        else next.delete(s.student.id);
      });
      return next;
    });
  };

  const handleBatchManual = () => {
    if (selected.size === 0 || !onBatchManualBoard) return;
    const ids = Array.from(selected);
    const n = onBatchManualBoard(ids);
    showToast(`批量人工确认上车完成，共处理 ${n} 名学生`);
    setSelected(new Set());
  };

  const handleBatchMissing = () => {
    if (selected.size === 0 || !onBatchMarkMissing) return;
    const ids = Array.from(selected);
    const n = onBatchMarkMissing(ids);
    showToast(`批量标记未乘车完成，共处理 ${n} 名学生`);
    setSelected(new Set());
  };

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

  const selectedCount = selected.size;
  const allCount = students.length;
  const allSelected = selectedCount === allCount && allCount > 0;

  return (
    <div className="relative space-y-4">
      {toast && (
        <div
          className={clsx(
            'sticky top-0 z-10 mx-auto flex max-w-md items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-3',
            toast.type === 'success' && 'bg-emerald-500 text-white',
            toast.type === 'warning' && 'bg-amber-500 text-white',
            toast.type === 'info' && 'bg-slate-700 text-white'
          )}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-700">待核验队列</h3>
            <p className="text-xs text-slate-500">
              支持多选批量处理，可直接人工确认上车或标记为未乘车
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 shadow-sm">
            <CheckSquare className="h-3.5 w-3.5 text-brand-600" />
            已选 <span className="font-mono font-semibold text-slate-800">{selectedCount}</span> / {allCount}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              allSelected ? setSelected(new Set()) : selectAllInStop(students, true)
            }
          >
            {allSelected ? '取消全选' : '全选'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<UserX className="h-3.5 w-3.5" />}
            disabled={selectedCount === 0}
            onClick={handleBatchMissing}
          >
            批量未乘车
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            disabled={selectedCount === 0}
            onClick={handleBatchManual}
          >
            批量人工确认
          </Button>
        </div>
      </div>

      <StatusBadge variant="danger" size="md">
        待处理 {allCount} 人
      </StatusBadge>

      <div className="space-y-5">
        {groupedByStop.map(([stopId, list]) => {
          const stop = allStops.find((s) => s.id === stopId);
          const route: BusRoute | undefined = allRoutes.find(
            (r) => r.id === list[0]?.student.routeId
          );
          const allInStopSelected = list.every((s) => selected.has(s.student.id));
          const someInStopSelected = list.some((s) => selected.has(s.student.id));

          return (
            <div
              key={stopId}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded p-0.5 transition-colors hover:bg-slate-200/60"
                    onClick={() => selectAllInStop(list, !allInStopSelected)}
                    aria-label="站点全选"
                  >
                    {allInStopSelected ? (
                      <CheckSquare className="h-4 w-4 text-brand-600" />
                    ) : someInStopSelected ? (
                      <CheckSquare className="h-4 w-4 text-brand-400 opacity-80" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-300" />
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">{stop?.name}</span>
                    <span className="text-xs text-slate-400">· {stop?.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {someInStopSelected && (
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                      已选 {list.filter((s) => selected.has(s.student.id)).length} 人
                    </span>
                  )}
                  <StatusBadge variant="danger" size="sm">
                    {list.length} 人待核验
                  </StatusBadge>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {list.map((item, idx) => {
                  const isChecked = selected.has(item.student.id);
                  return (
                    <div
                      key={item.student.id}
                      className={clsx(
                        'group flex items-center justify-between gap-3 p-4 transition-colors',
                        isChecked ? 'bg-brand-50/40' : 'hover:bg-slate-50/60'
                      )}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <button
                          type="button"
                          className="shrink-0 rounded p-0.5 transition-colors hover:bg-slate-200/60"
                          onClick={() => toggleSelect(item.student.id)}
                          aria-label="选择学生"
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-brand-600" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                          )}
                        </button>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                          <User className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

UnverifiedQueue.displayName = 'UnverifiedQueue';
