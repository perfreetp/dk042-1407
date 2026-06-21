import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { Select } from '../../common';
import { Button } from '../../common';
import { DateInput } from '../../common/Input';
import type { ShiftType } from '../../../types';
import { useBusCheckStore } from '../../../store';
import { campuses, routes as allRoutes } from '../../../data';

export const FilterBar: React.FC = () => {
  const { filterConditions, setCampus, setRoute, setShift, setDate } = useBusCheckStore();

  const campusOptions = React.useMemo(
    () => campuses.map((c) => ({ value: c.id, label: c.name })),
    []
  );

  const routeOptions = React.useMemo(
    () =>
      allRoutes
        .filter((r) => r.campusId === filterConditions.campusId)
        .map((r) => ({ value: r.id, label: r.name })),
    [filterConditions.campusId]
  );

  const shiftOptions: { value: string; label: string }[] = [
    { value: 'morning', label: '早班（上学）' },
    { value: 'evening', label: '晚班（放学）' },
  ];

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[160px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-slate-600">选择校区</label>
          <Select
            options={campusOptions}
            value={filterConditions.campusId}
            onChange={setCampus}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-slate-600">选择线路</label>
          <Select
            options={routeOptions}
            value={filterConditions.routeId}
            onChange={setRoute}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-slate-600">班次类型</label>
          <Select
            options={shiftOptions}
            value={filterConditions.shift}
            onChange={(v) => setShift(v as ShiftType)}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-xs font-medium text-slate-600">选择日期</label>
          <DateInput value={filterConditions.date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="ml-auto">
          <Button variant="outline" icon={<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />} onClick={handleRefresh}>
            刷新数据
          </Button>
        </div>
      </div>
    </div>
  );
};

FilterBar.displayName = 'FilterBar';
