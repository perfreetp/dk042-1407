import type { RiskLevel, StopStats, DashboardOverview, RideRecord, Student, BusStop, BusRoute, ExceptionRecord } from '../types';

export function calculateRiskLevel(notBoarded: number, totalExpected: number): RiskLevel {
  if (totalExpected === 0) return 'normal';
  const ratio = notBoarded / totalExpected;
  if (ratio === 0) return 'normal';
  if (ratio <= 0.05) return 'attention';
  if (ratio <= 0.15) return 'warning';
  return 'critical';
}

export function getRiskColor(level: RiskLevel): { bg: string; text: string; border: string; ring: string; solid: string } {
  switch (level) {
    case 'normal':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        ring: 'ring-emerald-500',
        solid: 'bg-emerald-500',
      };
    case 'attention':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        ring: 'ring-amber-500',
        solid: 'bg-amber-500',
      };
    case 'warning':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        ring: 'ring-orange-500',
        solid: 'bg-orange-500',
      };
    case 'critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        ring: 'ring-red-500',
        solid: 'bg-red-500',
      };
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'normal':
      return '正常';
    case 'attention':
      return '关注';
    case 'warning':
      return '警告';
    case 'critical':
      return '严重';
  }
}

export function calculateStopStats(
  stop: BusStop,
  studentsAtStop: Student[],
  records: RideRecord[]
): StopStats {
  const studentIdsAtStop = studentsAtStop.map((s) => s.id);
  const recordsAtStop = records.filter((r) => studentIdsAtStop.includes(r.studentId));

  const totalExpected = studentIdsAtStop.length;
  const boarded = recordsAtStop.filter((r) => r.status === 'boarded' || r.status === 'alighted').length;
  const manualBoarded = recordsAtStop.filter((r) => r.status === 'manual_boarded').length;
  const actualBoarded = boarded + manualBoarded;
  const notBoarded = recordsAtStop.filter((r) => r.status === 'missing' || r.status === 'pending').length;
  const alighted = recordsAtStop.filter((r) => r.status === 'alighted').length;
  const riskLevel = calculateRiskLevel(notBoarded, totalExpected);
  const completionRate = totalExpected === 0 ? 100 : Math.round((actualBoarded / totalExpected) * 100);

  return {
    stopId: stop.id,
    stopName: stop.name,
    stopOrder: stop.order,
    totalExpected,
    boarded,
    notBoarded,
    alighted,
    manualBoarded,
    riskLevel,
    completionRate,
  };
}

export function calculateDashboardOverview(
  routeStudents: Student[],
  records: RideRecord[],
  exceptions: ExceptionRecord[],
  date: string,
  shift: string
): DashboardOverview {
  const routeStudentIds = routeStudents.map((s) => s.id);
  const relevantRecords = records.filter((r) => routeStudentIds.includes(r.studentId));
  const relevantExceptions = exceptions.filter((e) => e.date === date && e.shift === shift);

  const totalStudents = routeStudentIds.length;
  const totalBoarded = relevantRecords.filter(
    (r) => r.status === 'boarded' || r.status === 'alighted'
  ).length;
  const totalManual = relevantRecords.filter((r) => r.status === 'manual_boarded').length;
  const totalNotBoarded = relevantRecords.filter(
    (r) => r.status === 'missing' || r.status === 'pending'
  ).length;
  const totalAlighted = relevantRecords.filter((r) => r.status === 'alighted').length;
  const totalExceptions = relevantExceptions.length;
  const actualBoarded = totalBoarded + totalManual;
  const completionRate = totalStudents === 0 ? 0 : Math.round((actualBoarded / totalStudents) * 100);

  return {
    totalStudents,
    totalBoarded: actualBoarded,
    totalNotBoarded,
    totalAlighted,
    totalExceptions,
    completionRate,
  };
}

export function getStatusLabel(status: RideRecord['status']): string {
  switch (status) {
    case 'pending':
      return '待乘车';
    case 'boarded':
      return '已上车';
    case 'alighted':
      return '已下车';
    case 'manual_boarded':
      return '人工确认';
    case 'missing':
      return '未乘车';
  }
}

export function getStatusColor(status: RideRecord['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'boarded':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'alighted':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'manual_boarded':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'missing':
      return 'bg-red-50 text-red-700 border-red-200';
  }
}

export function getShiftLabel(shift: 'morning' | 'evening'): string {
  return shift === 'morning' ? '早班' : '晚班';
}

export function findStudentById(id: string, students: Student[]): Student | undefined {
  return students.find((s) => s.id === id);
}

export function findStopById(id: string, stops: BusStop[]): BusStop | undefined {
  return stops.find((s) => s.id === id);
}

export function findRouteById(id: string, routes: BusRoute[]): BusRoute | undefined {
  return routes.find((r) => r.id === id);
}

export function searchStudents(keyword: string, students: Student[]): Student[] {
  if (!keyword.trim()) return [];
  const lower = keyword.toLowerCase();
  return students.filter(
    (s) =>
      s.name.toLowerCase().includes(lower) ||
      s.className.toLowerCase().includes(lower) ||
      s.studentNo.includes(keyword)
  );
}
