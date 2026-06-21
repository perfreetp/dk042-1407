import * as React from 'react';
import { format } from 'date-fns';
import type { ExceptionRecord, Student, BusRoute } from '../../../types';
import { students as allStudents, routes as allRoutes } from '../../../data';
import { StatusBadge } from '../../common';
import { User, Clock, ShieldAlert, UserCheck, FileText } from 'lucide-react';

interface ExceptionListProps {
  exceptions: ExceptionRecord[];
}

export const ExceptionList: React.FC<ExceptionListProps> = ({ exceptions }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayExceptions = React.useMemo(
    () =>
      exceptions
        .filter((e) => e.date === today)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [exceptions, today]
  );

  if (todayExceptions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <UserCheck className="h-7 w-7 text-emerald-500" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-700">今日暂无异常记录</p>
        <p className="mt-1 text-xs text-slate-500">所有学生都已正常刷卡乘车</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">今日异常登记</h3>
          </div>
          <StatusBadge variant="warning">共 {todayExceptions.length} 条</StatusBadge>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 bg-slate-50/30">
              <th className="px-5 py-3 text-left font-medium">时间</th>
              <th className="px-5 py-3 text-left font-medium">学生信息</th>
              <th className="px-5 py-3 text-left font-medium">班次</th>
              <th className="px-5 py-3 text-left font-medium">异常类型</th>
              <th className="px-5 py-3 text-left font-medium">处理原因</th>
              <th className="px-5 py-3 text-left font-medium">操作人</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {todayExceptions.map((record, idx) => {
              const student: Student | undefined = allStudents.find(
                (s) => s.id === record.studentId
              );
              const route: BusRoute | undefined = allRoutes.find(
                (r) => r.id === record.routeId
              );
              const time = record.createdAt.split(' ')[1] || '';

              return (
                <tr
                  key={record.id}
                  className="transition-colors hover:bg-slate-50/50 animate-in fade-in"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-mono text-sm text-slate-700">{time}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {student && (
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100">
                            <User className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{student.name}</p>
                            <p className="text-xs text-slate-500">
                              {student.className} · {student.studentNo}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge variant={record.shift === 'morning' ? 'info' : 'default'}>
                      {record.shift === 'morning' ? '早班' : '晚班'}
                    </StatusBadge>
                    {route && <p className="mt-1 text-xs text-slate-500">{route.name}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge variant="warning" dot>
                      {record.type === 'manual_board' ? '人工确认上车' : '漏刷处理'}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <p className="text-xs text-slate-700 font-medium">{record.reason}</p>
                      </div>
                      {record.remark && (
                        <p className="mt-1 pl-5 text-[11px] text-slate-500 line-clamp-2">
                          备注：{record.remark}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700">
                          {record.operatorName}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ExceptionList.displayName = 'ExceptionList';
