import type { BusRoute } from '../types';

export const routes: BusRoute[] = [
  {
    id: 'route-1',
    name: '1号线（东线）',
    campusId: 'campus-1',
    plateNumber: '京A·12345',
    driver: '张师傅',
    attendant: '李老师',
    stopIds: ['stop-1-1', 'stop-1-2', 'stop-1-3', 'stop-1-4', 'stop-1-5', 'stop-1-6'],
    studentIds: [],
  },
  {
    id: 'route-2',
    name: '2号线（东北线）',
    campusId: 'campus-1',
    plateNumber: '京A·23456',
    driver: '王师傅',
    attendant: '赵老师',
    stopIds: ['stop-2-1', 'stop-2-2', 'stop-2-3', 'stop-2-4', 'stop-2-5'],
    studentIds: [],
  },
  {
    id: 'route-3',
    name: '3号线（西线）',
    campusId: 'campus-2',
    plateNumber: '京A·34567',
    driver: '刘师傅',
    attendant: '陈老师',
    stopIds: ['stop-3-1', 'stop-3-2', 'stop-3-3', 'stop-3-4', 'stop-3-5', 'stop-3-6', 'stop-3-7'],
    studentIds: [],
  },
  {
    id: 'route-4',
    name: '4号线（西南线）',
    campusId: 'campus-2',
    plateNumber: '京A·45678',
    driver: '孙师傅',
    attendant: '周老师',
    stopIds: ['stop-4-1', 'stop-4-2', 'stop-4-3', 'stop-4-4', 'stop-4-5'],
    studentIds: [],
  },
];
