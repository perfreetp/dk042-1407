import * as React from 'react';
import type { HandoverSummary } from '../../../utils/stats';
import {
  ClipboardCheck,
  AlertOctagon,
  ShieldAlert,
  Handshake,
  UserCheck,
  CircleDot,
  Users,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { Button, StatusBadge } from '../../common';
import type { BusRoute, ShiftType } from '../../../types';
import { clsx } from 'clsx';
import { stops as allStops } from '../../../data';

interface HandoverSummaryCardProps {
  summary: HandoverSummary;
  date: string;
  shift: ShiftType;
  route: BusRoute | undefined;
  operatorName: string;
}

type TabKey = 'unverified' | 'manual' | 'missing' | 'notAlighted' | 'completed';

const TabItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
  variant: 'danger' | 'warning' | 'info' | 'success' | 'default';
}> = ({ active, onClick, icon, label, count, variant }) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      'group flex min-w-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
      active
        ? variant === 'danger'
          ? 'bg-red-50 text-red-700 ring-1 ring-red-200 shadow-sm'
          : variant === 'warning'
            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 shadow-sm'
            : variant === 'info'
              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-sm'
              : variant === 'success'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm'
                : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 shadow-sm'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    )}
  >
    {icon}
    <span className="truncate">{label}</span>
    <span
      className={clsx(
        'ml-0.5 rounded-full px-1.5 py-px text-[10px] font-semibold font-mono',
        active
          ? variant === 'danger'
            ? 'bg-red-100 text-red-700'
            : variant === 'warning'
              ? 'bg-amber-100 text-amber-700'
              : variant === 'info'
                ? 'bg-blue-100 text-blue-700'
                : variant === 'success'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
      )}
    >
      {count}
    </span>
  </button>
);

export const HandoverSummaryCard: React.FC<HandoverSummaryCardProps> = ({
  summary,
  date,
  shift,
  route,
  operatorName,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabKey>('unverified');

  const { totalStudents, unverified, manualBoarded, notRidden, notAlighted, completed, normalBoarded } = summary;
  const actualBoarded = normalBoarded + manualBoarded.length;
  const completionRate =
    totalStudents === 0 ? 100 : Math.round((actualBoarded / totalStudents) * 100);

  const getActiveList = () => {
    switch (activeTab) {
      case 'unverified':
        return unverified;
      case 'manual':
        return manualBoarded;
      case 'missing':
        return notRidden;
      case 'notAlighted':
        return notAlighted;
      case 'completed':
        return completed;
    }
  };

  const activeList = getActiveList();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/40 shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="border-b border-slate-100 bg-white/70 px-5 py-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">值班交接摘要</h3>
                <StatusBadge variant="info" size="sm">
                  {date}
                </StatusBadge>
                <StatusBadge variant={shift === 'morning' ? 'warning' : 'info'} size="sm">
                  {shift === 'morning' ? '早班' : '晚班'}
                </StatusBadge>
                {route && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {route.name} · {route.plateNumber}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                交接人：{operatorName} · 完成率 {completionRate}% · 共 {totalStudents} 名学生
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? '收起明细' : '展开明细'}
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div className="rounded-lg border border-red-100 bg-red-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-red-600">
              <AlertOctagon className="h-3 w-3" />
              未处理
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-red-600 font-mono">{unverified.length}</span>
              <span className="text-[10px] text-red-500">人</span>
            </div>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-amber-600">
              <ClipboardCheck className="h-3 w-3" />
              人工确认
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-amber-600 font-mono">{manualBoarded.length}</span>
              <span className="text-[10px] text-amber-500">人</span>
            </div>
          </div>
          <div className="rounded-lg border border-rose-100 bg-rose-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-rose-600">
              <ShieldAlert className="h-3 w-3" />
              未乘车
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-rose-600 font-mono">{notRidden.length}</span>
              <span className="text-[10px] text-rose-500">人</span>
            </div>
          </div>
          <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-sky-600">
              <CircleDot className="h-3 w-3" />
              未下车
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-sky-600 font-mono">{notAlighted.length}</span>
              <span className="text-[10px] text-sky-500">人</span>
            </div>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
              <UserCheck className="h-3 w-3" />
              已完成
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-emerald-600 font-mono">{completed.length}</span>
              <span className="text-[10px] text-emerald-500">人</span>
            </div>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-brand-500 transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {expanded && (
        <div className="space-y-3 p-5 animate-in fade-in slide-in-from-top-1">
          <div className="flex flex-wrap gap-1.5">
            <TabItem
              active={activeTab === 'unverified'}
              onClick={() => setActiveTab('unverified')}
              icon={<AlertOctagon className="h-3 w-3" />}
              label="未处理"
              count={unverified.length}
              variant="danger"
            />
            <TabItem
              active={activeTab === 'manual'}
              onClick={() => setActiveTab('manual')}
              icon={<ClipboardCheck className="h-3 w-3" />}
              label="人工确认"
              count={manualBoarded.length}
              variant="warning"
            />
            <TabItem
              active={activeTab === 'missing'}
              onClick={() => setActiveTab('missing')}
              icon={<ShieldAlert className="h-3 w-3" />}
              label="未乘车"
              count={notRidden.length}
              variant="danger"
            />
            <TabItem
              active={activeTab === 'notAlighted'}
              onClick={() => setActiveTab('notAlighted')}
              icon={<CircleDot className="h-3 w-3" />}
              label="未下车"
              count={notAlighted.length}
              variant="info"
            />
            <TabItem
              active={activeTab === 'completed'}
              onClick={() => setActiveTab('completed')}
              icon={<UserCheck className="h-3 w-3" />}
              label="已完成"
              count={completed.length}
              variant="success"
            />
          </div>

          {activeList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400">
              <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              当前分类暂无学生
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100 bg-white">
              <ul className="divide-y divide-slate-50">
                {activeList.map((s, idx) => {
                  const stopName = s.student.assignedStopId
                    ? allStops.find((st) => st.id === s.student.assignedStopId)?.name
                    : undefined;
                  return (
                    <li
                      key={s.student.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50/60"
                      style={{ animationDelay: `${idx * 20}ms` }}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {s.student.name}
                            <span className="ml-1.5 text-xs text-slate-500 font-normal">
                              {s.student.className}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            学号 {s.student.studentNo}
                            {stopName && (
                              <>
                                {' · '}
                                站点 {stopName}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        {s.boardTime && (
                          <span className="font-mono text-xs text-slate-600">上车 {s.boardTime}</span>
                        )}
                        {s.alightTime && (
                          <span className="font-mono text-xs text-slate-500">下车 {s.alightTime}</span>
                        )}
                        {activeTab === 'manual' && s.boardMethod === 'manual' && (
                          <StatusBadge variant="warning" size="sm">
                            人工
                          </StatusBadge>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

HandoverSummaryCard.displayName = 'HandoverSummaryCard';
