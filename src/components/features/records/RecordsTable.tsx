import * as React from 'react';
import type { EnrichedRideRecord } from '../../../types';
import { StatusBadge } from '../../common';
import { getStatusLabel, getStatusColor, getShiftLabel } from '../../../utils/stats';
import { User, Car, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

interface RecordsTableProps {
  records: EnrichedRideRecord[];
}

interface ExpandedRows {
  [key: string]: boolean;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({ records }) => {
  const [expanded, setExpanded] = React.useState<ExpandedRows>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sortedRecords = React.useMemo(
    () => [...records].sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      if (a.shift !== b.shift) return a.shift === 'morning' ? -1 : 1;
      return (b.boardTime || '').localeCompare(a.boardTime || '');
    }),
    [records]
  );

  if (sortedRecords.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">暂无匹配的乘车记录</p>
        <p className="mt-1 text-xs text-slate-400">请调整筛选条件后重新查询</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="w-8 px-4 py-3"></th>
              <th className="px-4 py-3 text-left font-medium">日期</th>
              <th className="px-4 py-3 text-left font-medium">班次</th>
              <th className="px-4 py-3 text-left font-medium">学生信息</th>
              <th className="px-4 py-3 text-left font-medium">车辆信息</th>
              <th className="px-4 py-3 text-left font-medium">上车</th>
              <th className="px-4 py-3 text-left font-medium">下车</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRecords.slice(0, 100).map((record, idx) => {
              const isExpanded = !!expanded[record.id];
              return (
                <React.Fragment key={record.id}>
                  <tr
                    className={clsx(
                      'transition-colors cursor-pointer',
                      isExpanded ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'
                    )}
                    style={{ animationDelay: `${idx * 10}ms` }}
                    onClick={() => toggleExpand(record.id)}
                  >
                    <td className="px-4 py-3">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-slate-700">{record.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={record.shift === 'morning' ? 'info' : 'default'}>
                        {getShiftLabel(record.shift)}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{record.studentName}</p>
                          <p className="text-xs text-slate-500">
                            {record.className} · {record.studentNo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                          <Car className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-mono font-medium text-slate-800">
                            {record.plateNumber}
                          </p>
                          <p className="text-xs text-slate-500">{record.routeName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {record.boardStopName ? (
                        <div>
                          <div className="flex items-center gap-1 text-slate-700">
                            <Clock className="h-3 w-3 text-emerald-500" />
                            <span className="font-mono text-xs">{record.boardTime}</span>
                            {record.boardMethod === 'manual' && (
                              <StatusBadge variant="warning" size="sm">
                                人工
                              </StatusBadge>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="h-3 w-3" />
                            {record.boardStopName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {record.alightStopName ? (
                        <div>
                          <div className="flex items-center gap-1 text-slate-700">
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span className="font-mono text-xs">{record.alightTime}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="h-3 w-3" />
                            {record.alightStopName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-50/30">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-xs text-slate-500">学号</p>
                            <p className="mt-0.5 text-sm font-medium text-slate-800 font-mono">
                              {record.studentNo}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">班级</p>
                            <p className="mt-0.5 text-sm font-medium text-slate-800">
                              {record.className}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">上车方式</p>
                            <p className="mt-0.5 text-sm font-medium text-slate-800">
                              {record.boardMethod === 'card' ? '刷卡上车' : '人工确认'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">下车方式</p>
                            <p className="mt-0.5 text-sm font-medium text-slate-800">
                              {record.alightMethod === 'card'
                                ? '刷卡下车'
                                : record.alightMethod === 'manual'
                                ? '人工确认'
                                : '尚未下车'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedRecords.length > 100 && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-center text-xs text-slate-500">
          共 {sortedRecords.length} 条记录，当前显示前100条
        </div>
      )}
    </div>
  );
};

RecordsTable.displayName = 'RecordsTable';
