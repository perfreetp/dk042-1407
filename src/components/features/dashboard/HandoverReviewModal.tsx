import * as React from 'react';
import type { StudentRideStatus } from '../../../utils/stats';
import type { Student, ShiftType, BusRoute, RideRecord, ExceptionRecord } from '../../../types';
import { Modal, Button, StatusBadge } from '../../common';
import {
  ClipboardCheck,
  AlertOctagon,
  ShieldAlert,
  CircleDot,
  ChevronRight,
  Clock,
  FileText,
  User,
  MapPin,
  XCircle,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  stops as allStops,
  routes as allRoutes,
  students as allStudents,
} from '../../../data';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { analyzeStudentAnomaly } from '../../../utils/stats';
import type { StudentAnomalyAlert } from '../../../utils/stats';

type FocusCategory = 'unverified' | 'manual' | 'missing' | 'notAlighted';

interface HandoverReviewModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  shift: ShiftType;
  route: BusRoute | undefined;
  unverified: StudentRideStatus[];
  manual: StudentRideStatus[];
  missing: StudentRideStatus[];
  notAlighted: StudentRideStatus[];
  allRideRecords: RideRecord[];
  allExceptions: ExceptionRecord[];
}

const categoryConfig: Record<
  FocusCategory,
  { label: string; icon: React.ReactNode; variant: 'danger' | 'warning' | 'info'; bg: string; desc: string }
> = {
  unverified: {
    label: '未处理',
    icon: <AlertOctagon className="h-3.5 w-3.5" />,
    variant: 'danger',
    bg: 'border-red-100 bg-red-50/60 text-red-700 hover:bg-red-100/70',
    desc: '还没刷卡，也没做人工确认或未乘车标记',
  },
  manual: {
    label: '人工确认',
    icon: <ClipboardCheck className="h-3.5 w-3.5" />,
    variant: 'warning',
    bg: 'border-amber-100 bg-amber-50/60 text-amber-700 hover:bg-amber-100/70',
    desc: '由值班老师确认上车，需班主任后续复核',
  },
  missing: {
    label: '未乘车',
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
    variant: 'danger',
    bg: 'border-rose-100 bg-rose-50/60 text-rose-700 hover:bg-rose-100/70',
    desc: '确认未坐本次校车，可能需通知家长',
  },
  notAlighted: {
    label: '未下车',
    icon: <CircleDot className="h-3.5 w-3.5" />,
    variant: 'info',
    bg: 'border-sky-100 bg-sky-50/60 text-sky-700 hover:bg-sky-100/70',
    desc: '已刷上车但还没刷下车，需确认是否滞留在车上',
  },
};

export const HandoverReviewModal: React.FC<HandoverReviewModalProps> = ({
  open,
  onClose,
  date,
  shift,
  route,
  unverified,
  manual,
  missing,
  notAlighted,
  allRideRecords,
  allExceptions,
}) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = React.useState<FocusCategory>('unverified');

  const getList = (c: FocusCategory): StudentRideStatus[] => {
    switch (c) {
      case 'unverified':
        return unverified;
      case 'manual':
        return manual;
      case 'missing':
        return missing;
      case 'notAlighted':
        return notAlighted;
    }
  };

  const focusCategories: FocusCategory[] = ['unverified', 'manual', 'missing', 'notAlighted'];
  const totalFocus = focusCategories.reduce((s, c) => s + getList(c).length, 0);
  const activeList = getList(activeCategory);
  const cfg = categoryConfig[activeCategory];

  const goToTimeline = (s: StudentRideStatus) => {
    sessionStorage.setItem(
      'timeline_target_student',
      JSON.stringify({ studentId: s.student.id })
    );
    navigate('/records');
  };

  const goToExceptionsWithStudent = (s: StudentRideStatus) => {
    sessionStorage.setItem(
      'exception_target_student',
      JSON.stringify({ studentId: s.student.id })
    );
    navigate('/exceptions');
  };

  const hasException = (studentId: string) =>
    allExceptions.some((e) => e.date === date && e.shift === shift && e.studentId === studentId);

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">交接复盘 · 重点学生清单</h3>
              <p className="mt-1 text-xs text-slate-500">
                {date} · {shift === 'morning' ? '早班' : '晚班'} · {route?.name || '未选线路'}{' '}
                {route ? `(${route.plateNumber})` : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant="danger" size="sm">
                需关注 {totalFocus} 人
              </StatusBadge>
              <Button
                variant="secondary"
                size="sm"
                icon={<FileText className="h-3.5 w-3.5" />}
                onClick={() => navigate('/exceptions')}
              >
                打开异常处理
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {focusCategories.map((c) => {
            const cc = categoryConfig[c];
            const list = getList(c);
            const active = activeCategory === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className={clsx(
                  'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all',
                  active
                    ? `${cc.bg} shadow-sm ring-2 ring-offset-1 ${
                        cc.variant === 'danger'
                          ? 'ring-red-200'
                          : cc.variant === 'warning'
                            ? 'ring-amber-200'
                            : 'ring-sky-200'
                      }`
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={clsx(
                      'flex h-7 w-7 items-center justify-center rounded-lg',
                      active ? 'bg-white/70' : 'bg-slate-100'
                    )}
                  >
                    {cc.icon}
                  </div>
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 font-mono text-[11px] font-bold',
                      active
                        ? 'bg-white/70'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {list.length}
                  </span>
                </div>
                <span className={clsx('text-sm font-semibold', active ? '' : 'text-slate-600')}>
                  {cc.label}
                </span>
              </button>
            );
          })}
        </div>

        <div
          className={clsx(
            'flex items-start gap-3 rounded-xl border p-3',
            cfg.bg
          )}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
          <div className="text-xs leading-relaxed opacity-90">
            <span className="font-semibold">{cfg.label}：</span>
            {cfg.desc}，共 {activeList.length} 人；可点击「查看时间线」跳转近 7 天个人乘车情况。
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">{cfg.label}学生列表</span>
              <StatusBadge variant={cfg.variant} size="sm">
                {activeList.length} 人
              </StatusBadge>
            </div>
            <span className="text-[11px] text-slate-400">点击行末按钮查看时间线 / 异常记录</span>
          </div>
          {activeList.length === 0 ? (
            <div className="p-10 text-center">
              <UserCheck className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-2 text-xs text-slate-500">该分类没有学生，状态良好 ✨</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[55vh] overflow-y-auto">
              {activeList.map((s, idx) => {
                const stop = s.student.assignedStopId
                  ? allStops.find((st) => st.id === s.student.assignedStopId)
                  : undefined;
                const anomaly: StudentAnomalyAlert = analyzeStudentAnomaly(
                  s.student.id,
                  allRideRecords,
                  7
                );
                const exception = hasException(s.student.id);

                return (
                  <li
                    key={s.student.id}
                    className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50/70"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        className={clsx(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          activeCategory === 'unverified'
                            ? 'bg-red-100 text-red-600'
                            : activeCategory === 'manual'
                              ? 'bg-amber-100 text-amber-600'
                              : activeCategory === 'missing'
                                ? 'bg-rose-100 text-rose-600'
                                : 'bg-sky-100 text-sky-600'
                        )}
                      >
                        <User className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-800">{s.student.name}</span>
                          <span className="text-[11px] text-slate-500">{s.student.className}</span>
                          {anomaly.level !== 'low' && (
                            <span
                              className={clsx(
                                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1',
                                anomaly.level === 'high'
                                  ? 'bg-red-50 text-red-700 ring-red-200'
                                  : 'bg-amber-50 text-amber-700 ring-amber-200'
                              )}
                              title={anomaly.reasons.join('；')}
                            >
                              {anomaly.level === 'high' ? (
                                <AlertOctagon className="h-2.5 w-2.5" />
                              ) : (
                                <AlertTriangle className="h-2.5 w-2.5" />
                              )}
                              近7天异常{anomaly.totalAnomalyCount}
                            </span>
                          )}
                          {exception && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-200">
                              <FileText className="h-2.5 w-2.5" />
                              已登记
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {stop?.name || '未分配站点'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UserCheck className="h-2.5 w-2.5" />
                            学号 {s.student.studentNo}
                          </span>
                          {s.boardTime && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              上车 {s.boardTime}
                            </span>
                          )}
                          {s.alightTime && (
                            <span className="inline-flex items-center gap-1">
                              <XCircle className="h-2.5 w-2.5" />
                              下车 {s.alightTime}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<ChevronRight className="h-3.5 w-3.5" />}
                        onClick={() => goToTimeline(s)}
                      >
                        查看时间线
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FileText className="h-3.5 w-3.5" />}
                        onClick={() => goToExceptionsWithStudent(s)}
                      >
                        异常记录
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};

HandoverReviewModal.displayName = 'HandoverReviewModal';
