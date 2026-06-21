export type ShiftType = 'morning' | 'evening';
export type RideStatus = 'pending' | 'boarded' | 'alighted' | 'manual_boarded' | 'missing';
export type RiskLevel = 'normal' | 'attention' | 'warning' | 'critical';
export type ExceptionType = 'manual_board' | 'missing_card';

export interface Student {
  id: string;
  name: string;
  studentNo: string;
  className: string;
  assignedStopId: string;
  routeId: string;
}

export interface BusStop {
  id: string;
  name: string;
  order: number;
  address: string;
  routeId: string;
}

export interface BusRoute {
  id: string;
  name: string;
  campusId: string;
  plateNumber: string;
  driver: string;
  attendant: string;
  stopIds: string[];
  studentIds: string[];
}

export interface Campus {
  id: string;
  name: string;
  routeIds: string[];
}

export interface RideRecord {
  id: string;
  studentId: string;
  routeId: string;
  date: string;
  shift: ShiftType;
  boardStopId?: string;
  boardTime?: string;
  boardMethod: 'card' | 'manual';
  alightStopId?: string;
  alightTime?: string;
  alightMethod: 'card' | 'manual' | null;
  status: RideStatus;
}

export interface ExceptionRecord {
  id: string;
  date: string;
  shift: ShiftType;
  studentId: string;
  routeId: string;
  type: ExceptionType;
  reason: string;
  remark?: string;
  operatorId: string;
  operatorName: string;
  createdAt: string;
}

export interface StopStats {
  stopId: string;
  stopName: string;
  stopOrder: number;
  totalExpected: number;
  boarded: number;
  notBoarded: number;
  alighted: number;
  manualBoarded: number;
  riskLevel: RiskLevel;
  completionRate: number;
}

export interface DashboardOverview {
  totalStudents: number;
  totalBoarded: number;
  totalNotBoarded: number;
  totalAlighted: number;
  totalExceptions: number;
  completionRate: number;
}

export interface FilterConditions {
  campusId: string;
  routeId: string;
  shift: ShiftType;
  date: string;
}

export interface RecordFilters {
  startDate: string;
  endDate: string;
  plateNumber: string;
  studentName: string;
  routeId: string;
}

export interface EnrichedRideRecord extends RideRecord {
  studentName: string;
  studentNo: string;
  className: string;
  plateNumber: string;
  routeName: string;
  boardStopName?: string;
  alightStopName?: string;
}

export interface AppState {
  campuses: Campus[];
  routes: BusRoute[];
  stops: BusStop[];
  students: Student[];
  rideRecords: RideRecord[];
  exceptionRecords: ExceptionRecord[];
  filters: FilterConditions;
  currentOperator: { id: string; name: string };
}
