import * as React from 'react';
import { AlertTriangle, Search, UserX } from 'lucide-react';
import { SearchInput } from '../components/common/Input';
import { StudentCard } from '../components/features/exceptions/StudentCard';
import { ExceptionForm } from '../components/features/exceptions/ExceptionForm';
import { ExceptionList } from '../components/features/exceptions/ExceptionList';
import { students as allStudents } from '../data';
import { searchStudents } from '../utils/stats';
import { useBusCheckStore } from '../store';
import type { Student, ShiftType } from '../types';
import { StatCard } from '../components/common';
import { format } from 'date-fns';

export const ExceptionsPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const { exceptionRecords, addExceptionRecord, updateRideRecordToManualBoard } = useBusCheckStore();

  const searchResults = React.useMemo(() => {
    if (!searchKeyword.trim()) return [];
    return searchStudents(searchKeyword, allStudents);
  }, [searchKeyword]);

  const handleManualBoard = (student: Student) => {
    setSelectedStudent(student);
    setFormOpen(true);
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-slate-800">异常处理</h2>
        <p className="mt-1 text-sm text-slate-500">
          学生忘带卡或漏刷时，在此页面进行人工确认和记录
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="今日异常登记"
          value={todayExceptionCount}
          icon={<AlertTriangle className="h-6 w-6" />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          accentColor="warning"
        />
        <StatCard
          title="在校学生总数"
          value={allStudents.length}
          icon={<Search className="h-6 w-6" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          accentColor="info"
        />
        <StatCard
          title="人工确认入口"
          value="随时处理"
          icon={<UserX className="h-6 w-6" />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          accentColor="success"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <Search className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-700">学生搜索</h3>
            <p className="text-xs text-slate-500">
              输入学生姓名、班级或学号进行快速查找
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
