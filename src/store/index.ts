import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type {
  FilterConditions,
  ShiftType,
  ExceptionRecord,
  RideRecord,
  RecordFilters,
} from '../types';
import {
  campuses as mockCampuses,
  routes as mockRoutes,
  stops as mockStops,
  students as mockStudents,
  rideRecords as mockRideRecords,
  initialExceptions,
  generateExceptionId,
} from '../data';

interface BusCheckStore {
  filterConditions: FilterConditions;
  recordFilters: RecordFilters;
  rideRecords: RideRecord[];
  exceptionRecords: ExceptionRecord[];
  currentOperator: { id: string; name: string };

  setCampus: (campusId: string) => void;
  setRoute: (routeId: string) => void;
  setShift: (shift: ShiftType) => void;
  setDate: (date: string) => void;
  setRecordFilters: (filters: Partial<RecordFilters>) => void;
  resetRecordFilters: () => void;

  addExceptionRecord: (data: {
    studentId: string;
    routeId: string;
    shift: ShiftType;
    date: string;
    type: 'manual_board' | 'missing_card';
    reason: string;
    remark?: string;
  }) => ExceptionRecord;

  updateRideRecordToManualBoard: (studentId: string, routeId: string, date: string, shift: ShiftType) => void;
}

const today = format(new Date(), 'yyyy-MM-dd');

const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

export const useBusCheckStore = create<BusCheckStore>()(
  persist(
    (set, get) => ({
      filterConditions: {
        campusId: mockCampuses[0].id,
        routeId: mockRoutes[0].id,
        shift: 'morning',
        date: today,
      },
      recordFilters: {
        startDate: format(sevenDaysAgo, 'yyyy-MM-dd'),
        endDate: today,
        plateNumber: '',
        studentName: '',
        routeId: '',
      },
      rideRecords: mockRideRecords,
      exceptionRecords: initialExceptions,
      currentOperator: { id: 'admin-1', name: '王管理员' },

      setCampus: (campusId) => {
        const routesForCampus = mockRoutes.filter((r) => r.campusId === campusId);
        set((state) => ({
          filterConditions: {
            ...state.filterConditions,
            campusId,
            routeId: routesForCampus[0]?.id || '',
          },
        }));
      },

      setRoute: (routeId) =>
        set((state) => ({
          filterConditions: {
            ...state.filterConditions,
            routeId,
          },
        })),

      setShift: (shift) =>
        set((state) => ({
          filterConditions: {
            ...state.filterConditions,
            shift,
          },
        })),

      setDate: (date) =>
        set((state) => ({
          filterConditions: {
            ...state.filterConditions,
            date,
          },
        })),

      setRecordFilters: (filters) =>
        set((state) => ({
          recordFilters: {
            ...state.recordFilters,
            ...filters,
          },
        })),

      resetRecordFilters: () => {
        const start = format(sevenDaysAgo, 'yyyy-MM-dd');
        set({
          recordFilters: {
            startDate: start,
            endDate: today,
            plateNumber: '',
            studentName: '',
            routeId: '',
          },
        });
      },

      addExceptionRecord: (data) => {
        const { currentOperator } = get();
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const newRecord: ExceptionRecord = {
          id: generateExceptionId(),
          date: data.date,
          shift: data.shift,
          studentId: data.studentId,
          routeId: data.routeId,
          type: data.type,
          reason: data.reason,
          remark: data.remark,
          operatorId: currentOperator.id,
          operatorName: currentOperator.name,
          createdAt: `${data.date} ${timeStr}`,
        };

        set((state) => ({
          exceptionRecords: [newRecord, ...state.exceptionRecords],
        }));

        return newRecord;
      },

      updateRideRecordToManualBoard: (studentId, routeId, date, shift) => {
        set((state) => ({
          rideRecords: state.rideRecords.map((r) => {
            if (r.studentId === studentId && r.routeId === routeId && r.date === date && r.shift === shift) {
              const now = new Date();
              const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              const student = mockStudents.find((s) => s.id === studentId);
              return {
                ...r,
                status: 'manual_boarded',
                boardMethod: 'manual',
                boardTime: timeStr,
                boardStopId: student?.assignedStopId,
              };
            }
            return r;
          }),
        }));
      },
    }),
    {
      name: 'bus-check-storage',
      partialize: (state) => ({
        exceptionRecords: state.exceptionRecords,
        rideRecords: state.rideRecords,
        filterConditions: state.filterConditions,
      }),
    }
  )
);
