import * as React from 'react';
import type { Student, RideRecord } from '../../../types';
import { Modal, StatusBadge } from '../../common';
import { User, Calendar, MapPin, Bus, Sun, Moon, XCircle, Clock, UserCheck } from 'lucide-react';
import {
  getStatusLabel,
  getStatusColor,
  getShiftLabel,
  findStopById,
  findRouteById,
} from '../../../utils/stats';
import { stops as allStops, routes as allRoutes } from '../../../data';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface StudentTimelineModalProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  rideRecords: RideRecord[];
}

type DayRecord = {
  date: string;
  label: string;
  weekday: string;
  isToday: boolean;
  morning: RideRecord | undefined;
  evening: RideRecord | undefined;
};

export const StudentTimelineModal: React.FC<StudentTimelineModalProps> = ({
  open,
  onClose,
  student,
  rideRecords,
}) => {
  const days = React.useMemo<DayRecord[]>(() => {
    const result: DayRecord[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const weekday = format(d, 'EEE', { locale: zhCN });
      result.push({
        date: dateStr,
        label: format(d, 'MM月dd日'),
        weekday,
        isToday: i === 0,
        morning: rideRecords.find(
          (r) => r.studentId === student?.id && r.date === dateStr && r.shift === 'morning'
        ),
        evening: rideRecords.find(
          (r) => r.studentId === student?.id && r.date === dateStr && r.shift === 'evening'
        ),
      });
    }
    return result;
  }, [student, rideRecords]);

  const stats = React.useMemo(() => {
    let boardedDays = 0;
    let missedDays = 0;
    days.forEach((d) => {
      const hasMorningRide =
        d.morning &&
        (d.morning.status === 'boarded' ||
          d.morning.status === 'alighted' ||
          d.morning.status === 'manual_boarded');
      const hasEveningRide =
        d.evening &&
        (d.evening.status === 'boarded' ||
          d.evening.status === 'alighted' ||
          d.evening.status === 'manual_boarded');
      if (hasMorningRide || hasEveningRide) boardedDays++;
      if (!hasMorningRide && !hasEveningRide && !d.isToday) missedDays++;
    });
    return { boardedDays, missedDays };
  }, [days]);

  const renderShiftCard = (date: string, shift: 'morning' | 'evening', record?: RideRecord) => {
    const route = record ? findRouteById(record.routeId, allRoutes) : undefined;
    const boardStop = record?.boardStopId ? findStopById(record.boardStopId, allStops) : undefined;
    const alightStop = record?.alightStopId
      ? findStopById(record.alightStopId, allStops)
      : undefined;

    const isMorning = shift === 'morning';
    const ShiftIcon = isMorning ? Sun : Moon;
    const shiftBg = isMorning
      ? 'from-amber-50 to-orange-50/40 border-amber-100'
      : 'from-indigo-50 to-purple-50/40 border-indigo-100';
    const shiftIconBg = isMorning ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600';

    return (
      <div
        className={`flex-1 rounded-xl border bg-gradient-to-br ${shiftBg} p-3 transition-all hover:shadow-md`}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={`flex h-6 w-6 items-center justify-center rounded-md ${shiftIconBg}`}>
              <ShiftIcon className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{getShiftLabel(shift)}</span>
          </div>
          {record ? (
            <StatusBadge
              variant={
                record.status === 'missing' || record.status === 'pending'
                  ? 'danger'
                  : record.status === 'manual_boarded'
                    ? 'warning'
                    : record.status === 'alighted'
                      ? 'success'
                      : 'info'
              }
              size="sm"
              dot
            >
              {getStatusLabel(record.status)}
            </StatusBadge>
          ) : (
            <span className="text-[10px] text-slate-400">无记录</span>
          )}
        </div>

        {record ? (
          <div className="space-y-1.5">
            {route && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Bus className="h-3 w-3" />
                <span>{route.name} · {route.plateNumber}</span>
              </div>
            )}
            {record.boardTime && boardStop && (
              <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                <div className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <UserCheck className="h-2 w-2 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-700 font-medium">上车</span>
                  <span className="mx-1 text-slate-400">·</span>
                  <span className="text-slate-600">{boardStop.name}</span>
                  <span className="mx-1 text-slate-400">·</span>
                  <span className="font-mono text-slate-600">{record.boardTime}</span>
                  {record.boardMethod === 'manual' && (
                    <span className="ml-1 text-amber-600">（人工）</span>
                  )}
                </div>
              </div>
            )}
            {record.alightTime && alightStop && (
              <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                <div className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-sky-100">
                  <XCircle className="h-2 w-2 text-sky-600" />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-700 font-medium">下车</span>
                  <span className="mx-1 text-slate-400">·</span>
                  <span className="text-slate-600">{alightStop.name}</span>
                  <span className="mx-1 text-slate-400">·</span>
                  <span className="font-mono text-slate-600">{record.alightTime}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pt-2 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" />
            <span>该班次无乘车记录</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} size="xl">
      {student && (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/60 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md shadow-brand-500/20">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{student.name}</h3>
                <p className="mt-0.5 text-sm text-slate-600">
                  {student.className} · 学号 {student.studentNo}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  上车站点：
                  {allStops.find((s) => s.id === student.assignedStopId)?.name || '未分配'}
                </p>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                <div className="text-lg font-bold text-emerald-600 font-mono">
                  {stats.boardedDays}
                </div>
                <div className="text-[10px] text-slate-500">近7天乘车</div>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
                <div className="text-lg font-bold text-red-500 font-mono">{stats.missedDays}</div>
                <div className="text-[10px] text-slate-500">未乘车日</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-700">近7天乘车时间线</h4>
            </div>
            <div className="space-y-3">
              {days.map((day, idx) => (
                <div
                  key={day.date}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{day.label}</span>
                      <span className="text-xs text-slate-500">{day.weekday}</span>
                    </div>
                    {day.isToday && (
                      <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
                        今天
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {renderShiftCard(day.date, 'morning', day.morning)}
                    {renderShiftCard(day.date, 'evening', day.evening)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              已完成上下车
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              已上车进行中
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              人工确认
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              未乘车 / 漏刷
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

StudentTimelineModal.displayName = 'StudentTimelineModal';
