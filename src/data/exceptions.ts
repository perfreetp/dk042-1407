import { format } from 'date-fns';
import type { ExceptionRecord, ShiftType } from '../types';
import { students } from './students';
import { routes as routesList } from './routes';

const today = format(new Date(), 'yyyy-MM-dd');

const exceptionReasons = [
  '学生忘带乘车卡',
  '卡片消磁无法识别',
  '卡片丢失补办中',
  '临时换卡未激活',
  '机器故障未刷卡',
  '家长陪同乘车未带卡',
  '新学生尚未办卡',
];

function generateExceptions(): ExceptionRecord[] {
  const exceptions: ExceptionRecord[] = [];
  let idCounter = 1;

  const manualBoardStudents = students.filter(
    (s) => s.routeId === 'route-1' || s.routeId === 'route-3'
  ).slice(0, 8);

  manualBoardStudents.forEach((student, idx) => {
    const route = routesList.find((r) => r.id === student.routeId);
    const shift: ShiftType = idx < 4 ? 'morning' : 'evening';
    const reasonIdx = idx % exceptionReasons.length;
    const hour = shift === 'morning' ? 7 : 16;
    const minute = 20 + idx * 3;

    exceptions.push({
      id: `exception-${idCounter++}`,
      date: today,
      shift,
      studentId: student.id,
      routeId: student.routeId,
      type: 'manual_board',
      reason: exceptionReasons[reasonIdx],
      remark: reasonIdx % 2 === 0 ? '家长已电话确认' : undefined,
      operatorId: 'admin-1',
      operatorName: shift === 'morning' ? (route?.attendant || '李老师') : (route?.driver || '张师傅'),
      createdAt: `${today} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(idx * 7 + 12).padStart(2, '0')}`,
    });
  });

  return exceptions;
}

export const initialExceptions: ExceptionRecord[] = generateExceptions();

export function generateExceptionId(): string {
  return `exception-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
