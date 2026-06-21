import * as React from 'react';
import { Search, RotateCcw, Download } from 'lucide-react';
import { Button } from '../../common';
import { Select } from '../../common';
import { Input, DateInput } from '../../common/Input';
import type { RecordFilters } from '../../../types';
import { useBusCheckStore } from '../../../store';
import { routes as allRoutes } from '../../../data';

export const RecordsFilter: React.FC = () => {
  const { recordFilters, setRecordFilters, resetRecordFilters } = useBusCheckStore();
  const [localFilters, setLocalFilters] = React.useState<RecordFilters>(recordFilters);

  React.useEffect(() => {
    setLocalFilters(recordFilters);
  }, [recordFilters]);

  const routeOptions = React.useMemo(
    () => [
      { value: '', label: '全部线路' },
      ...allRoutes.map((r) => ({ value: r.id, label: r.name })),
    ],
    []
  );

  const handleApply = () => {
    setRecordFilters(localFilters);
  };

  const handleReset = () => {
    resetRecordFilters();
  };

  const handleExport = () => {
    const header = '日期,班次,学生姓名,班级,车牌号,线路,上车时间,上车站点,下车时间,下车站点,状态\n';
    alert('已模拟导出CSV数据到剪贴板（演示功能）');
    console.log('导出数据:', header);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">开始日期</label>
          <DateInput
            value={localFilters.startDate}
            onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">结束日期</label>
          <DateInput
            value={localFilters.endDate}
            onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">选择线路</label>
          <Select
            options={routeOptions}
            value={localFilters.routeId}
            onChange={(v) => setLocalFilters({ ...localFilters, routeId: v })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">车牌号</label>
          <Input
            placeholder="如：京A·12345"
            value={localFilters.plateNumber}
            onChange={(e) => setLocalFilters({ ...localFilters, plateNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">学生姓名</label>
          <Input
            placeholder="输入学生姓名"
            leftIcon={<Search className="h-4 w-4" />}
            value={localFilters.studentName}
            onChange={(e) => setLocalFilters({ ...localFilters, studentName: e.target.value })}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
        <Button variant="outline" icon={<RotateCcw className="h-4 w-4" />} onClick={handleReset}>
          重置条件
        </Button>
        <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={handleExport}>
          导出Excel
        </Button>
        <Button variant="primary" icon={<Search className="h-4 w-4" />} onClick={handleApply}>
          查询
        </Button>
      </div>
    </div>
  );
};

RecordsFilter.displayName = 'RecordsFilter';
