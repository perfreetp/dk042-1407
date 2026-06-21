import { format, subDays } from 'date-fns';
import type { RideRecord, ShiftType } from '../types';
import { students } from './students';
import { routes } from './routes';

const today = new Date();

function generateDateList(): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(format(subDays(today, i), 'yyyy-MM-dd'));
  }
  return dates;
}

const dates = generateDateList();

function randomTime(baseHour: number, baseMinute: number, variance: number): string {
  const h = baseHour;
  const m = baseMinute + Math.floor(Math.random() * variance);
  return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

function generateRideRecordsForRoute(routeId: string, date: string, shift: ShiftType): RideRecord[] {
  const route = routes.find((r) => r.id === routeId);
  if (!route) return [];
  const routeStops = route.stopIds;
  const routeStudents = students.filter((s) => s.routeId === routeId);
  const records: RideRecord[] = [];
  const isToday = date === dates[0];

  routeStudents.forEach((student, idx) => {
    const baseHour = shift === 'morning' ? 7 : 16;
    const baseMinute = shift === 'morning' ? 15 : 30;
    const stopOrderIdx = routeStops.indexOf(student.assignedStopId);

    const rand = Math.random();
    let status: RideRecord['status'] = 'alighted';
    let boardTime: string | undefined;
    let alightTime: string | undefined;
    let boardMethod: 'card' | 'manual' = 'card';
    let alightMethod: 'card' | 'manual' | null = 'card';
    const boardStopId = student.assignedStopId;
    const alightStopId = shift === 'morning' ? routeStops[routeStops.length - 1] : routeStops[0];

    if (isToday && shift === 'morning') {
      if (rand < 0.78) {
        status = 'alighted';
        boardTime = randomTime(baseHour, baseMinute + stopOrderIdx * 3, 5);
        alightTime = randomTime(baseHour + 1, baseMinute + stopOrderIdx * 2, 8);
      } else if (rand < 0.88) {
        status = 'boarded';
        boardTime = randomTime(baseHour, baseMinute + stopOrderIdx * 3, 5);
        boardMethod = Math.random() < 0.2 ? 'manual' : 'card';
        if (boardMethod === 'manual') status = 'manual_boarded';
      } else if (rand < 0.95) {
        status = 'manual_boarded';
        boardTime = randomTime(baseHour, baseMinute + stopOrderIdx * 3, 5);
        boardMethod = 'manual';
      } else {
        status = 'missing';
        boardMethod = 'card';
      }
    } else {
      if (rand < 0.92) {
        status = 'alighted';
        boardTime = randomTime(baseHour, baseMinute + stopOrderIdx * 3, 5);
        alightTime = randomTime(baseHour + 1, baseMinute + stopOrderIdx * 2, 8);
        if (Math.random() < 0.05) {
          boardMethod = 'manual';
          status = 'manual_boarded';
        }
      } else if (rand < 0.98) {
        status = 'boarded';
        boardTime = randomTime(baseHour, baseMinute + stopOrderIdx * 3, 5);
        alightMethod = null;
      } else {
        status = 'missing';
        boardMethod = 'card';
        alightMethod = null;
      }
    }

    records.push({
      id: `ride-${routeId}-${date}-${shift}-${student.id}`,
      studentId: student.id,
      routeId,
      date,
      shift,
      boardStopId: status !== 'missing' ? boardStopId : undefined,
      boardTime: status !== 'missing' ? boardTime : undefined,
      boardMethod: status === 'missing' ? 'card' : boardMethod,
      alightStopId: status === 'alighted' ? alightStopId : undefined,
      alightTime: status === 'alighted' ? alightTime : undefined,
      alightMethod: status === 'alighted' ? alightMethod : null,
      status,
    });
  });

  return records;
}

const allRecords: RideRecord[] = [];

dates.forEach((date) => {
  ['morning', 'evening'].forEach((shift) => {
    routes.forEach((route) => {
      allRecords.push(...generateRideRecordsForRoute(route.id, date, shift as ShiftType));
    });
  });
});

export const rideRecords: RideRecord[] = allRecords;

export function getRideRecordsByRouteDateShift(
  routeId: string,
  date: string,
  shift: ShiftType
): RideRecord[] {
  return rideRecords.filter(
    (r) => r.routeId === routeId && r.date === date && r.shift === shift
  );
}
