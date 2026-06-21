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
  const recordsMap = new Map(records.map((r) => [r.studentId, r]));

  const totalExpected = studentIdsAtStop.length;

  let boarded = 0;
  let manualBoarded = 0;
  let alighted = 0;
  let notBoarded = 0;

  studentsAtStop.forEach((student) => {
    const record = recordsMap.get(student.id);
    if (!record) {
      notBoarded++;
      return;
    }
    switch (record.status) {
      case 'boarded':
        boarded++;
        break;
      case 'alighted':
        boarded++;
        alighted++;
        break;
      case 'manual_boarded':
        manualBoarded++;
        break;
      case 'missing':
      case 'pending':
      default:
        notBoarded++;
        break;
    }
  });

  const actualBoarded = boarded + manualBoarded;
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
  const recordsMap = new Map(records.map((r) => [r.studentId, r]));
  const relevantExceptions = exceptions.filter((e) => e.date === date && e.shift === shift);

  const totalStudents = routeStudents.length;

  let totalBoarded = 0;
  let totalManual = 0;
  let totalNotBoarded = 0;
  let totalAlighted = 0;

  routeStudents.forEach((student) => {
    const record = recordsMap.get(student.id);
    if (!record) {
      totalNotBoarded++;
      return;
    }
    switch (record.status) {
      case 'boarded':
        totalBoarded++;
        break;
      case 'alighted':
        totalBoarded++;
        totalAlighted++;
        break;
      case 'manual_boarded':
        totalManual++;
        break;
      case 'missing':
      case 'pending':
      default:
        totalNotBoarded++;
        break;
    }
  });

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

export interface StudentRideStatus {
  student: Student;
  record?: RideRecord;
  effectiveStatus: RideRecord['status'] | 'no_record';
  boardTime?: string;
  alightTime?: string;
  boardStopName?: string;
  alightStopName?: string;
  boardMethod?: 'card' | 'manual';
}

export function getStudentsRideStatus(
  students: Student[],
  records: RideRecord[],
  stops: BusStop[]
): StudentRideStatus[] {
  const recordsMap = new Map(records.map((r) => [r.studentId, r]));
  const stopsMap = new Map(stops.map((s) => [s.id, s]));

  return students.map((student) => {
    const record = recordsMap.get(student.id);
    let effectiveStatus: StudentRideStatus['effectiveStatus'] = 'no_record';
    if (record) {
      effectiveStatus = record.status;
    }
    return {
      student,
      record,
      effectiveStatus,
      boardTime: record?.boardTime,
      alightTime: record?.alightTime,
      boardStopName: record?.boardStopId ? stopsMap.get(record.boardStopId)?.name : undefined,
      alightStopName: record?.alightStopId ? stopsMap.get(record.alightStopId)?.name : undefined,
      boardMethod: record?.boardMethod,
    };
  });
}

export function getEffectiveStatusLabel(status: StudentRideStatus['effectiveStatus']): string {
  if (status === 'no_record') return '无记录';
  return getStatusLabel(status);
}

export function getEffectiveStatusColor(status: StudentRideStatus['effectiveStatus']): string {
  if (status === 'no_record') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'missing' || status === 'pending') return 'bg-red-50 text-red-700 border-red-200';
  return getStatusColor(status);
}

export function getUnverifiedStudents(
  routeStudents: Student[],
  records: RideRecord[],
  stops: BusStop[]
): StudentRideStatus[] {
  return getStudentsRideStatus(routeStudents, records, stops).filter(
    (s) => s.effectiveStatus === 'no_record' || s.effectiveStatus === 'missing' || s.effectiveStatus === 'pending'
  );
}

export interface HandoverSummary {
  totalStudents: number;
  normalBoarded: number;
  manualBoarded: StudentRideStatus[];
  notRidden: StudentRideStatus[];
  unverified: StudentRideStatus[];
  notAlighted: StudentRideStatus[];
  completed: StudentRideStatus[];
}

export function getHandoverSummary(
  routeStudents: Student[],
  records: RideRecord[],
  stops: BusStop[]
): HandoverSummary {
  const all = getStudentsRideStatus(routeStudents, records, stops);

  const unverified: StudentRideStatus[] = [];
  const manualBoarded: StudentRideStatus[] = [];
  const notRidden: StudentRideStatus[] = [];
  const notAlighted: StudentRideStatus[] = [];
  const completed: StudentRideStatus[] = [];
  let normalBoarded = 0;

  all.forEach((s) => {
    switch (s.effectiveStatus) {
      case 'no_record':
      case 'pending':
        unverified.push(s);
        break;
      case 'missing':
        notRidden.push(s);
        break;
      case 'manual_boarded':
        manualBoarded.push(s);
        break;
      case 'boarded':
        notAlighted.push(s);
        normalBoarded++;
        break;
      case 'alighted':
        completed.push(s);
        normalBoarded++;
        break;
    }
  });

  return {
    totalStudents: all.length,
    normalBoarded,
    manualBoarded,
    notRidden,
    unverified,
    notAlighted,
    completed,
  };
}
