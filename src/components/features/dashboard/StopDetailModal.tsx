import * as React from 'react';
import { Modal, StatusBadge } from '../../common';
import type { BusStop, Student, RideRecord, BusStop as BusStopType } from '../../../types';
import type { StudentRideStatus } from '../../../utils/stats';
import { getStudentsRideStatus, getEffectiveStatusLabel, getEffectiveStatusColor } from '../../../utils/stats';
import { User, Clock, LogOut, ChevronRight, Filter } from 'lucide-react';
import { stops as allStops } from '../../../data';
import { clsx } from 'clsx';

interface StopDetailModalProps {
  open: boolean;
  onClose: () => void;
  stop: BusStop | null;
  studentsAtStop: Student[];
  records: RideRecord[];
}

type FilterType = 'all' | 'not_boarded' | 'boarded' | 'alighted' | 'manual';

export const StopDetailModal: React.FC<StopDetailModalProps> = ({
  open,
  onClose,
  stop,
  studentsAtStop,
  records,
}) => {
  const [filter, setFilter] = React.useState<FilterType>('all');

  const studentStatuses = React.useMemo<StudentRideStatus[]>(() => {
    return getStudentsRideStatus(studentsAtStop, records, allStops);
  }, [studentsAtStop, records]);

  const filteredStatuses = React.useMemo(() => {
    switch (filter) {
      case 'not_boarded':
        return studentStatuses.filter(
          (s) =>
            s.effectiveStatus === 'no_record' ||
            s.effectiveStatus === 'missing' ||
            s.effectiveStatus === 'pending'
        );
      case 'boarded':
        return studentStatuses.filter((s) => s.effectiveStatus === 'boarded');
      case 'alighted':
        return studentStatuses.filter((s) => s.effectiveStatus === 'alighted');
      case 'manual':
        return studentStatuses.filter((s) => s.effectiveStatus === 'manual_boarded');
      default:
        return studentStatuses;
    }
  }, [studentStatuses, filter]);

  const counts = React.useMemo(() => {
    const notBoarded = studentStatuses.filter(
      (s) =>
        s.effectiveStatus === 'no_record' ||
        s.effectiveStatus === 'missing' ||
        s.effectiveStatus === 'pending'
    ).length;
    const boarded = studentStatuses.filter((s) => s.effectiveStatus === 'boarded').length;
    const alighted = studentStatuses.filter((s) => s.effectiveStatus === 'alighted').length;
    const manual = studentStatuses.filter((s) => s.effectiveStatus === 'manual_boarded').length;
    return { notBoarded, boarded, alighted, manual, total: studentStatuses.length };
  }, [studentStatuses]);

  const filterOptions: { value: FilterType; label: string; count: number; variant: string }[] = [
    { value: 'all', label: '全部', count: counts.total, variant: 'default' },
    { value: 'not_boarded', label: '未刷卡', count: counts.notBoarded, variant: 'danger' },
    { value: 'boarded', label: '已上车', count: counts.boarded, variant: 'info' },
    { value: 'alighted', label: '已下车', count: counts.alighted, variant: 'success' },
    { value: 'manual', label: '人工确认', count: counts.manual, variant: 'warning' },
  ];

  if (!stop) return null;

  return (
    <Modal open={open} onClose={onClose} title={`${stop.name} - 学生明细`} size="lg">
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">站点地址</p>
              <p className="text-sm font-medium text-slate-700">{stop.address}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">应上车学生</p>
              <p className="font-mono text-xl font-bold text-slate-800">{counts.total} 人</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>筛选：</span>
          </div>
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                filter === opt.value
                  ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              {opt.label}
              <span
                className={clsx(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold',
                  filter === opt.value
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                )}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        <div className="max-h-[480px] overflow-y-auto -mx-1 px-1">
          {filteredStatuses.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">该筛选条件下暂无学生</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStatuses.map((item, idx) => (
                <div
                  key={item.student.id}
                  className={clsx(
                    'group flex items-center justify-between gap-3 rounded-xl border p-3 transition-all',
                    item.effectiveStatus === 'no_record' ||
                    item.effectiveStatus === 'missing' ||
                    item.effectiveStatus === 'pending'
                      ? 'border-red-200 bg-red-50/30 hover:bg-red-50/60'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  )}
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={clsx(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        item.effectiveStatus === 'no_record' ||
                        item.effectiveStatus === 'missing' ||
                        item.effectiveStatus === 'pending'
                          ? 'bg-red-100'
                          : 'bg-slate-100'
                      )}
                    >
                      <User
                        className={clsx(
                          'h-5 w-5',
                          item.effectiveStatus === 'no_record' ||
                          item.effectiveStatus === 'missing' ||
                          item.effectiveStatus === 'pending'
                            ? 'text-red-600'
                            : 'text-slate-500'
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">
                          {item.student.name}
                        </span>
                        <StatusBadge
                          variant={
                            item.effectiveStatus === 'no_record' ||
                            item.effectiveStatus === 'missing' ||
                            item.effectiveStatus === 'pending'
                              ? 'danger'
                              : item.effectiveStatus === 'alighted'
                              ? 'success'
                              : item.effectiveStatus === 'boarded'
                              ? 'info'
                              : 'warning'
                          }
                          size="sm"
                          dot
                        >
                          {getEffectiveStatusLabel(item.effectiveStatus)}
                          {item.boardMethod === 'manual' && '（人工）'}
                        </StatusBadge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.student.className} · 学号 {item.student.studentNo}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 text-xs">
                    {item.boardTime ? (
                      <div className="text-right">
                        <p className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3 text-emerald-500" />
                          上车
                        </p>
                        <p className="font-mono font-semibold text-slate-700">
                          {item.boardTime}
                        </p>
                      </div>
                    ) : (
                      <div className="w-14 text-center">
                        <p className="text-slate-300">—</p>
                      </div>
                    )}

                    <ChevronRight className="h-4 w-4 text-slate-300" />

                    {item.alightTime ? (
                      <div className="text-right">
                        <p className="flex items-center gap-1 text-slate-500">
                          <LogOut className="h-3 w-3 text-blue-500" />
                          下车
                        </p>
                        <p className="font-mono font-semibold text-slate-700">
                          {item.alightTime}
                        </p>
                      </div>
                    ) : (
                      <div className="w-14 text-center">
                        <p className="text-slate-300">—</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

StopDetailModal.displayName = 'StopDetailModal';
