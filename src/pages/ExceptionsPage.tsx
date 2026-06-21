import * as React from 'react';
import {
  AlertTriangle,
  Search,
  UserX,
  Users,
  Clock,
  ListChecks,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  PartyPopper,
  X,
  User,
} from 'lucide-react';
import { SearchInput } from '../components/common/Input';
import { StudentCard } from '../components/features/exceptions/StudentCard';
import { ExceptionForm } from '../components/features/exceptions/ExceptionForm';
import { ExceptionList } from '../components/features/exceptions/ExceptionList';
import { UnverifiedQueue } from '../components/features/exceptions/UnverifiedQueue';
import { students as allStudents, stops as allStops } from '../data';
import { searchStudents, getUnverifiedStudents } from '../utils/stats';
import { useBusCheckStore } from '../store';
import type { Student, ShiftType } from '../types';
import { StatCard, Button } from '../components/common';
import { format } from 'date-fns';
import { getShiftLabel } from '../utils/stats';
import { clsx } from 'clsx';

type ReceiptAction = 'manual' | 'missing';
interface ReceiptEntry {
  studentId: string;
  name: string;
  action: ReceiptAction;
  time: string;
}
interface ReceiptState {
  entries: ReceiptEntry[];
  manualCount: number;
  missingCount: number;
}

export const ExceptionsPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [receipt, setReceipt] = React.useState<ReceiptState | null>(null);
  const [justCompleted, setJustCompleted] = React.useState(false);
  const {
    exceptionRecords,
    addExceptionRecord,
    updateRideRecordToManualBoard,
    markStudentAsMissing,
    filterConditions,
    rideRecords,
    batchManualBoard,
    batchMarkMissing,
  } = useBusCheckStore();

  const searchResults = React.useMemo(() => {
    if (!searchKeyword.trim()) return [];
    return searchStudents(searchKeyword, allStudents);
  }, [searchKeyword]);

  const unverifiedStudents = React.useMemo(() => {
    const { routeId, date, shift } = filterConditions;
    const routeStudents = allStudents.filter((s) => s.routeId === routeId);
    const relevantRecords = rideRecords.filter(
      (r) => r.routeId === routeId && r.date === date && r.shift === shift
    );
    return getUnverifiedStudents(routeStudents, relevantRecords, allStops);
  }, [filterConditions, rideRecords]);

  const nowTimeStr = () =>
    `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

  const appendReceipt = (newEntries: ReceiptEntry[]) => {
    if (newEntries.length === 0) return;
    setReceipt((prev) => {
      const merged = prev
        ? {
            entries: [...newEntries, ...prev.entries].slice(0, 30),
            manualCount: prev.manualCount + newEntries.filter((e) => e.action === 'manual').length,
            missingCount: prev.missingCount + newEntries.filter((e) => e.action === 'missing').length,
          }
        : {
            entries: newEntries.slice(0, 30),
            manualCount: newEntries.filter((e) => e.action === 'manual').length,
            missingCount: newEntries.filter((e) => e.action === 'missing').length,
          };
      return merged;
    });
  };

  React.useEffect(() => {
    if (unverifiedStudents.length === 0 && !justCompleted) {
      setJustCompleted(true);
      const t = setTimeout(() => setJustCompleted(false), 4000);
      return () => clearTimeout(t);
    }
  }, [unverifiedStudents.length]);

  const handleManualBoard = (student: Student) => {
    setSelectedStudent(student);
    setFormOpen(true);
  };

  const handleQuickManualBoard = (student: Student) => {
    const { routeId, date, shift } = filterConditions;
    addExceptionRecord({
      studentId: student.id,
      routeId: routeId || student.routeId,
      shift,
      date,
      type: 'manual_board',
      reason: '队列快速确认：学生忘带卡',
    });
    updateRideRecordToManualBoard(
      student.id,
      routeId || student.routeId,
      date,
      shift
    );
    appendReceipt([
      { studentId: student.id, name: student.name, action: 'manual', time: nowTimeStr() },
    ]);
  };

  const handleMarkMissing = (student: Student, routeId: string) => {
    const { date, shift } = filterConditions;
    markStudentAsMissing(student.id, routeId, date, shift, '值班老师确认未乘车');
    appendReceipt([
      { studentId: student.id, name: student.name, action: 'missing', time: nowTimeStr() },
    ]);
  };

  const handleBatchManualBoard = (studentIds: string[]) => {
    const { routeId, date, shift } = filterConditions;
    const n = batchManualBoard(studentIds, routeId || '', date, shift);
    const idsSet = new Set(studentIds.slice(0, n));
    const entries: ReceiptEntry[] = allStudents
      .filter((s) => idsSet.has(s.id))
      .map((s) => ({
        studentId: s.id,
        name: s.name,
        action: 'manual' as const,
        time: nowTimeStr(),
      }));
    appendReceipt(entries);
    return n;
  };

  const handleBatchMarkMissing = (studentIds: string[]) => {
    const { routeId, date, shift } = filterConditions;
    const n = batchMarkMissing(studentIds, routeId || '', date, shift, '批量标记：值班老师确认未乘车');
    const idsSet = new Set(studentIds.slice(0, n));
    const entries: ReceiptEntry[] = allStudents
      .filter((s) => idsSet.has(s.id))
      .map((s) => ({
        studentId: s.id,
        name: s.name,
        action: 'missing' as const,
        time: nowTimeStr(),
      }));
    appendReceipt(entries);
    return n;
  };

  const handleExceptionSubmit = (data: {
    reason: string;
    remark?: string;
    shift: ShiftType;
    routeId: string;
    date: string;
  }) => {
    if (!selectedStudent) return;

    addExceptionRecord({
      studentId: selectedStudent.id,
      routeId: data.routeId,
      shift: data.shift,
      date: data.date,
      type: 'manual_board',
      reason: data.reason,
      remark: data.remark,
    });

    updateRideRecordToManualBoard(
      selectedStudent.id,
      data.routeId,
      data.date,
      data.shift
    );

    setSearchKeyword('');
    setSelectedStudent(null);
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayExceptionCount = exceptionRecords.filter((e) => e.date === today).length;
  const { routeId, date, shift } = filterConditions;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-slate-800">异常处理</h2>
        <p className="mt-1 text-sm text-slate-500">
          待核验队列集中处理未刷卡学生，支持人工确认上车或标记未乘车
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="今日异常登记"
          value={todayExceptionCount}
          icon={<AlertTriangle className="h-6 w-6" />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          accentColor="warning"
        />
        <StatCard
          title="待核验学生"
          value={unverifiedStudents.length}
          icon={<ListChecks className="h-6 w-6" />}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          accentColor="danger"
        />
        <StatCard
          title="在校学生总数"
          value={allStudents.length}
          icon={<Users className="h-6 w-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          accentColor="info"
        />
        <StatCard
          title="当前核验班次"
          value={`${getShiftLabel(shift)}`}
          icon={<Clock className="h-6 w-6" />}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          accentColor="primary"
        />
      </div>

      {justCompleted && unverifiedStudents.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-5 shadow-sm animate-in fade-in slide-in-from-top-3">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-200/50 blur-2xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
                <PartyPopper className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-800">
                  🎉 太棒了，当前班次已全部核验完成！
                </h3>
                <p className="mt-1 text-sm text-emerald-700/80">
                  所有学生都已正常刷卡、人工确认上车或标记为未乘车。
                  {receipt && receipt.entries.length > 0 && (
                    <>
                      本次共处理
                      <span className="mx-1 font-mono font-semibold text-emerald-800">
                        {receipt.manualCount + receipt.missingCount}
                      </span>
                      条记录：人工确认
                      <span className="mx-1 font-semibold text-amber-700">{receipt.manualCount}</span>
                      人，未乘车
                      <span className="mx-1 font-semibold text-rose-700">{receipt.missingCount}</span>
                      人。
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md p-1.5 text-emerald-600 transition-colors hover:bg-emerald-100"
              onClick={() => setJustCompleted(false)}
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {receipt && receipt.entries.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700">处理结果回执</h3>
                <p className="text-[11px] text-slate-500">本次操作共处理了 {receipt.manualCount + receipt.missingCount} 名学生</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {receipt.manualCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                  <ShieldCheck className="h-3 w-3" />
                  人工确认 {receipt.manualCount} 人
                </span>
              )}
              {receipt.missingCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
                  <XCircle className="h-3 w-3" />
                  未乘车 {receipt.missingCount} 人
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReceipt(null)}
              >
                清空
              </Button>
            </div>
          </div>
          <ul className="grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {receipt.entries.map((e) => (
              <li
                key={`${e.studentId}-${e.time}-${e.action}`}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs',
                  e.action === 'manual'
                    ? 'bg-amber-50/60 text-amber-800'
                    : 'bg-rose-50/60 text-rose-800'
                )}
              >
                <div
                  className={clsx(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                    e.action === 'manual' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                  )}
                >
                  <User className="h-3 w-3" />
                </div>
                <span className="truncate font-medium">{e.name}</span>
                <span className="ml-auto shrink-0">
                  {e.action === 'manual' ? '已人工确认' : '已标记未乘车'}
                </span>
                <span className="shrink-0 font-mono text-slate-500">{e.time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <UnverifiedQueue
        students={unverifiedStudents}
        currentShift={shift}
        currentDate={date}
        onManualBoard={handleQuickManualBoard}
        onMarkMissing={handleMarkMissing}
        onBatchManualBoard={handleBatchManualBoard}
        onBatchMarkMissing={handleBatchMarkMissing}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <Search className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-700">搜索学生（手动处理）</h3>
            <p className="text-xs text-slate-500">
              未在队列中找到时，可通过姓名/班级/学号精确查找
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <SearchInput
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="输入学生姓名、班级或学号搜索..."
          />
        </div>

        {searchKeyword.trim() && (
          <div className="mt-5">
            {searchResults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
                <UserX className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  未找到匹配的学生，请检查关键词是否正确
                </p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    找到 <span className="font-semibold text-slate-700">{searchResults.length}</span> 条结果
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {searchResults.slice(0, 12).map((student, idx) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      index={idx}
                      onManualBoard={handleManualBoard}
                    />
                  ))}
                </div>
                {searchResults.length > 12 && (
                  <p className="mt-4 text-center text-xs text-slate-500">
                    仅显示前12条结果，请细化关键词
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <ExceptionList exceptions={exceptionRecords} />

      <ExceptionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        student={selectedStudent}
        onSubmit={handleExceptionSubmit}
      />
    </div>
  );
};

ExceptionsPage.displayName = 'ExceptionsPage';
