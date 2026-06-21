import type { Student } from '../types';

const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗', '郑', '梁', '谢', '宋', '唐'];
const names = ['子轩', '梓涵', '浩然', '雨桐', '宇航', '思琪', '博文', '欣怡', '皓轩', '若曦', '梓豪', '梦瑶', '俊熙', '雨萱', '一诺', '佳怡', '天佑', '诗涵', '子墨', '晨曦', '俊杰', '语桐', '泽宇', '思远', '嘉怡', '梓轩', '欣然', '浩宇', '佳琪', '天宇'];
const classes = [
  '一年级(1)班', '一年级(2)班', '一年级(3)班',
  '二年级(1)班', '二年级(2)班',
  '三年级(1)班', '三年级(2)班', '三年级(3)班',
  '四年级(1)班', '四年级(2)班',
  '五年级(1)班', '五年级(2)班',
  '六年级(1)班', '六年级(2)班',
];

function generateStudents(routeId: string, stopIds: string[], count: number, startIdx: number): Student[] {
  const students: Student[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startIdx + i;
    const nameIdx = idx % names.length;
    const surnameIdx = idx % surnames.length;
    const fullName = surnames[surnameIdx] + names[nameIdx];
    const stopIdx = idx % stopIds.length;
    const classIdx = idx % classes.length;
    students.push({
      id: `student-${routeId}-${idx + 1}`,
      name: fullName,
      studentNo: `202${Math.floor(idx / 50) + 3}${String(idx + 1).padStart(4, '0')}`,
      className: classes[classIdx],
      assignedStopId: stopIds[stopIdx],
      routeId,
    });
  }
  return students;
}

export const students: Student[] = [
  ...generateStudents('route-1', ['stop-1-1', 'stop-1-2', 'stop-1-3', 'stop-1-4', 'stop-1-5', 'stop-1-6'], 42, 0),
  ...generateStudents('route-2', ['stop-2-1', 'stop-2-2', 'stop-2-3', 'stop-2-4', 'stop-2-5'], 35, 50),
  ...generateStudents('route-3', ['stop-3-1', 'stop-3-2', 'stop-3-3', 'stop-3-4', 'stop-3-5', 'stop-3-6', 'stop-3-7'], 48, 100),
  ...generateStudents('route-4', ['stop-4-1', 'stop-4-2', 'stop-4-3', 'stop-4-4', 'stop-4-5'], 36, 160),
];

export function getStudentsByRoute(routeId: string): Student[] {
  return students.filter((s) => s.routeId === routeId);
}

export function getStudentsByStop(stopId: string): Student[] {
  return students.filter((s) => s.assignedStopId === stopId);
}
