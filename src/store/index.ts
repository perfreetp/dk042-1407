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
  markStudentAsMissing: (studentId: string, routeId: string, date: string, shift: ShiftType, reason?: string) => void;
  batchManualBoard: (studentIds: string[], routeId: string, date: string, shift: ShiftType) => number;
  batchMarkMissing: (studentIds: string[], routeId: string, date: string, shift: ShiftType, reason?: string) => number;
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
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const student = mockStudents.find((s) => s.id === studentId);

        set((state) => {
          const existingIndex = state.rideRecords.findIndex(
            (r) => r.studentId === studentId && r.routeId === routeId && r.date === date && r.shift === shift
          );

          if (existingIndex >= 0) {
            const updated = [...state.rideRecords];
            updated[existingIndex] = {
              ...updated[existingIndex],
              status: 'manual_boarded',
              boardMethod: 'manual',
              boardTime: timeStr,
              boardStopId: student?.assignedStopId,
            };
            return { rideRecords: updated };
          }

          const newRecord: RideRecord = {
            id: `ride-${routeId}-${date}-${shift}-${studentId}-manual-${Date.now()}`,
            studentId,
            routeId,
            date,
            shift,
            boardMethod: 'manual',
            boardTime: timeStr,
            boardStopId: student?.assignedStopId,
            alightMethod: null,
            status: 'manual_boarded',
          };
          return { rideRecords: [...state.rideRecords, newRecord] };
        });
      },

      markStudentAsMissing: (studentId, routeId, date, shift, reason) => {
        const { currentOperator, rideRecords } = get();
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        const student = mockStudents.find((s) => s.id === studentId);
        const existingRecord = rideRecords.find(
          (r) => r.studentId === studentId && r.routeId === routeId && r.date === date && r.shift === shift
        );

        let updatedRecords: RideRecord[];
        if (existingRecord) {
          updatedRecords = rideRecords.map((r) =>
            r.id === existingRecord.id ? { ...r, status: 'missing' as const } : r
          );
        } else {
          const newRecord: RideRecord = {
            id: `ride-${routeId}-${date}-${shift}-${studentId}-missing-${Date.now()}`,
            studentId,
            routeId,
            date,
            shift,
            boardMethod: 'card',
            alightMethod: null,
            status: 'missing',
          };
          updatedRecords = [...rideRecords, newRecord];
        }

        const exceptionRecord: ExceptionRecord = {
          id: generateExceptionId(),
          date,
          shift,
          studentId,
          routeId,
          type: 'missing_card',
          reason: reason || '确认未乘车',
          remark: '标记为未乘车',
          operatorId: currentOperator.id,
          operatorName: currentOperator.name,
          createdAt: `${date} ${timeStr}`,
        };

        set({
          rideRecords: updatedRecords,
          exceptionRecords: [exceptionRecord, ...get().exceptionRecords],
        });
      },

      batchManualBoard: (studentIds, routeId, date, shift) => {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const createdAtStr = `${date} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const { currentOperator } = get();
        let processedCount = 0;

        set((state) => {
          const newRecords = [...state.rideRecords];
          const newExceptions: ExceptionRecord[] = [];

          studentIds.forEach((studentId) => {
            const student = mockStudents.find((s) => s.id === studentId);
            const existingIndex = newRecords.findIndex(
              (r) => r.studentId === studentId && r.routeId === routeId && r.date === date && r.shift === shift
            );

            if (existingIndex >= 0) {
              if (newRecords[existingIndex].status !== 'manual_boarded' &&
                  newRecords[existingIndex].status !== 'boarded' &&
                  newRecords[existingIndex].status !== 'alighted') {
                newRecords[existingIndex] = {
                  ...newRecords[existingIndex],
                  status: 'manual_boarded',
                  boardMethod: 'manual',
                  boardTime: timeStr,
                  boardStopId: student?.assignedStopId,
                };
                processedCount++;
                newExceptions.push({
                  id: generateExceptionId(),
                  date,
                  shift,
                  studentId,
                  routeId,
                  type: 'manual_board',
                  reason: '批量确认：学生忘带卡',
                  operatorId: currentOperator.id,
                  operatorName: currentOperator.name,
                  createdAt: createdAtStr,
                });
              }
            } else {
              newRecords.push({
                id: `ride-${routeId}-${date}-${shift}-${studentId}-manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                studentId,
                routeId,
                date,
                shift,
                boardMethod: 'manual',
                boardTime: timeStr,
                boardStopId: student?.assignedStopId,
                alightMethod: null,
                status: 'manual_boarded',
              });
              processedCount++;
              newExceptions.push({
                id: generateExceptionId(),
                date,
                shift,
                studentId,
                routeId,
                type: 'manual_board',
                reason: '批量确认：学生忘带卡',
                operatorId: currentOperator.id,
                operatorName: currentOperator.name,
                createdAt: createdAtStr,
              });
            }
          });

          return {
            rideRecords: newRecords,
            exceptionRecords: [...newExceptions, ...state.exceptionRecords],
          };
        });

        return processedCount;
      },

      batchMarkMissing: (studentIds, routeId, date, shift, reason) => {
        const now = new Date();
        const createdAtStr = `${date} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const { currentOperator } = get();
        let processedCount = 0;

        set((state) => {
          const newRecords = [...state.rideRecords];
          const newExceptions: ExceptionRecord[] = [];

          studentIds.forEach((studentId) => {
            const existingIndex = newRecords.findIndex(
              (r) => r.studentId === studentId && r.routeId === routeId && r.date === date && r.shift === shift
            );

            if (existingIndex >= 0) {
              if (newRecords[existingIndex].status !== 'missing') {
                newRecords[existingIndex] = {
                  ...newRecords[existingIndex],
                  status: 'missing',
                };
                processedCount++;
                newExceptions.push({
                  id: generateExceptionId(),
                  date,
                  shift,
                  studentId,
                  routeId,
                  type: 'missing_card',
                  reason: reason || '批量标记：确认未乘车',
                  remark: '标记为未乘车',
                  operatorId: currentOperator.id,
                  operatorName: currentOperator.name,
                  createdAt: createdAtStr,
                });
              }
            } else {
              newRecords.push({
                id: `ride-${routeId}-${date}-${shift}-${studentId}-missing-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                studentId,
                routeId,
                date,
                shift,
                boardMethod: 'card',
                alightMethod: null,
                status: 'missing',
              });
              processedCount++;
              newExceptions.push({
                id: generateExceptionId(),
                date,
                shift,
                studentId,
                routeId,
                type: 'missing_card',
                reason: reason || '批量标记：确认未乘车',
                remark: '标记为未乘车',
                operatorId: currentOperator.id,
                operatorName: currentOperator.name,
                createdAt: createdAtStr,
              });
            }
          });

          return {
            rideRecords: newRecords,
            exceptionRecords: [...newExceptions, ...state.exceptionRecords],
          };
        });

        return processedCount;
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
