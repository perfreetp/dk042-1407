import * as React from 'react';
import { useBusCheckStore } from '../store';
import { FilterBar } from '../components/features/dashboard/FilterBar';
import { OverviewCards, OverallProgress } from '../components/features/dashboard/OverviewCards';
import { StopList } from '../components/features/dashboard/StopList';
import { StopDetailModal } from '../components/features/dashboard/StopDetailModal';
import { HandoverSummaryCard } from '../components/features/dashboard/HandoverSummaryCard';
import type { StopStats, BusStop } from '../types';
import {
  calculateStopStats,
  calculateDashboardOverview,
  getShiftLabel,
  getHandoverSummary,
} from '../utils/stats';
import { routes as allRoutes, stops as allStops, students as allStudents } from '../data';
import { Car } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { filterConditions, rideRecords, exceptionRecords, currentOperator } = useBusCheckStore();

  const { routeId, date, shift } = filterConditions;
  const [selectedStop, setSelectedStop] = React.useState<BusStop | null>(null);

  const route = React.useMemo(
    () => allRoutes.find((r) => r.id === routeId),
    [routeId]
  );

  const routeStops = React.useMemo<BusStop[]>(
    () => allStops.filter((s) => s.routeId === routeId),
    [routeId]
  );

  const routeStudents = React.useMemo(
    () => allStudents.filter((s) => s.routeId === routeId),
    [routeId]
  );

  const relevantRecords = React.useMemo(
    () => rideRecords.filter((r) => r.routeId === routeId && r.date === date && r.shift === shift),
    [rideRecords, routeId, date, shift]
  );

  const overview = React.useMemo(
    () =>
      calculateDashboardOverview(
        routeStudents,
        relevantRecords,
        exceptionRecords,
        date,
        shift
      ),
    [routeStudents, relevantRecords, exceptionRecords, date, shift]
  );

  const stopStats = React.useMemo<StopStats[]>(() => {
    return routeStops.map((stop) => {
      const studentsAtStop = routeStudents.filter((s) => s.assignedStopId === stop.id);
      return calculateStopStats(stop, studentsAtStop, relevantRecords);
    });
  }, [routeStops, routeStudents, relevantRecords]);

  const studentsAtSelectedStop = React.useMemo(() => {
    if (!selectedStop) return [];
    return routeStudents.filter((s) => s.assignedStopId === selectedStop.id);
  }, [selectedStop, routeStudents]);

  const handover = React.useMemo(
    () => getHandoverSummary(routeStudents, relevantRecords, allStops),
    [routeStudents, relevantRecords]
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">线路看板</h2>
          <p className="mt-1 text-sm text-slate-500">
            实时监控学生上下车情况，点击站点卡片查看学生明细
          </p>
        </div>
        {route && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <Car className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">
                {getShiftLabel(shift as 'morning' | 'evening')} · {route.plateNumber}
              </p>
              <p className="text-sm font-semibold text-slate-800">{route.name}</p>
            </div>
          </div>
        )}
      </div>

      <FilterBar />

      <OverviewCards overview={overview} />

      <OverallProgress completionRate={overview.completionRate} />

      <HandoverSummaryCard
        summary={handover}
        date={date}
        shift={shift as 'morning' | 'evening'}
        route={route}
        operatorName={currentOperator.name}
      />

      <StopList stopStats={stopStats} onStopClick={setSelectedStop} />

      <StopDetailModal
        open={!!selectedStop}
        onClose={() => setSelectedStop(null)}
        stop={selectedStop}
        studentsAtStop={studentsAtSelectedStop}
        records={relevantRecords}
      />
    </div>
  );
};

DashboardPage.displayName = 'DashboardPage';
