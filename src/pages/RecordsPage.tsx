import * as React from 'react';
import { useBusCheckStore } from '../store';
import { RecordsFilter } from '../components/features/records/RecordsFilter';
import { RecordsSummary } from '../components/features/records/RecordsSummary';
import { RecordsTable } from '../components/features/records/RecordsTable';
import { StudentTimelineModal } from '../components/features/records/StudentTimelineModal';
import type { EnrichedRideRecord, Student } from '../types';
import {
  students as allStudents,
  routes as allRoutes,
  stops as allStops,
} from '../data';
import { ClipboardList, Calendar } from 'lucide-react';

export const RecordsPage: React.FC = () => {
  const { recordFilters, rideRecords } = useBusCheckStore();
  const [timelineStudent, setTimelineStudent] = React.useState<Student | null>(null);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem('timeline_target_student');
      if (!raw) return;
      const parsed = JSON.parse(raw) as { studentId: string };
      const student = allStudents.find((s) => s.id === parsed.studentId);
      if (student) {
        setTimeout(() => setTimelineStudent(student), 200);
      }
    } catch {}
    sessionStorage.removeItem('timeline_target_student');
  }, []);

  const enrichedRecords = React.useMemo<EnrichedRideRecord[]>(() => {
    const { startDate, endDate, plateNumber, studentName, routeId } = recordFilters;

    return rideRecords
      .filter((r) => {
        if (r.date < startDate || r.date > endDate) return false;
        if (routeId && r.routeId !== routeId) return false;

        const route = allRoutes.find((rt) => rt.id === r.routeId);
        if (plateNumber && route) {
          if (!route.plateNumber.toLowerCase().includes(plateNumber.toLowerCase())) return false;
        }

        if (studentName) {
          const student = allStudents.find((s) => s.id === r.studentId);
          if (!student || !student.name.toLowerCase().includes(studentName.toLowerCase()))
            return false;
        }

        return true;
      })
      .map((r) => {
        const student = allStudents.find((s) => s.id === r.studentId);
        const route = allRoutes.find((rt) => rt.id === r.routeId);
        const boardStop = allStops.find((s) => s.id === r.boardStopId);
        const alightStop = allStops.find((s) => s.id === r.alightStopId);

        return {
          ...r,
          studentName: student?.name || '未知',
          studentNo: student?.studentNo || '-',
          className: student?.className || '未知',
          plateNumber: route?.plateNumber || '-',
          routeName: route?.name || '未知线路',
          boardStopName: boardStop?.name,
          alightStopName: alightStop?.name,
        } as EnrichedRideRecord;
      });
  }, [recordFilters, rideRecords]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">记录查询</h2>
          <p className="mt-1 text-sm text-slate-500">
            回看历史乘车记录，点击学生姓名查看个人乘车时间线
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <ClipboardList className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">查询结果</p>
            <p className="text-sm font-semibold text-slate-800">
              共 {enrichedRecords.length} 条记录
            </p>
          </div>
        </div>
      </div>

      <RecordsFilter />

      <RecordsSummary records={enrichedRecords} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-700">乘车明细</h3>
            <div className="hidden sm:flex items-center gap-1 rounded-md bg-brand-50 border border-brand-100 px-2 py-0.5 text-[10px] text-brand-700">
              <Calendar className="h-3 w-3" />
              点击学生姓名查看时间线
            </div>
          </div>
          <p className="text-xs text-slate-500">点击行可展开查看详情</p>
        </div>
        <RecordsTable
          records={enrichedRecords}
          allRideRecords={rideRecords}
          onStudentClick={setTimelineStudent}
        />
      </div>

      <StudentTimelineModal
        open={timelineStudent !== null}
        onClose={() => setTimelineStudent(null)}
        student={timelineStudent}
        rideRecords={rideRecords}
      />
    </div>
  );
};

RecordsPage.displayName = 'RecordsPage';
