import * as React from 'react';
import { User, GraduationCap, Hash, MapPin } from 'lucide-react';
import { Button } from '../../common';
import { ShieldCheck } from 'lucide-react';
import type { Student, BusStop, BusRoute } from '../../../types';
import { stops as allStops, routes as allRoutes } from '../../../data';

interface StudentCardProps {
  student: Student;
  index: number;
  onManualBoard: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, index, onManualBoard }) => {
  const stop: BusStop | undefined = allStops.find((s) => s.id === student.assignedStopId);
  const route: BusRoute | undefined = allRoutes.find((r) => r.id === student.routeId);

  return (
    <div
      className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-inner">
          <User className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="truncate text-base font-semibold text-slate-800">
                {student.name}
              </h4>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {student.studentNo}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {student.className}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{route?.name} · {stop?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{route?.plateNumber} · 司机 {route?.driver}</span>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              icon={<ShieldCheck className="h-4 w-4" />}
              onClick={() => onManualBoard(student)}
            >
              人工确认上车
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

StudentCard.displayName = 'StudentCard';
