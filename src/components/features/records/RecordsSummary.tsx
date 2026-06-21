import * as React from 'react';
import { Users, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { StatCard } from '../../common';
import type { EnrichedRideRecord } from '../../../types';

interface RecordsSummaryProps {
  records: EnrichedRideRecord[];
}

export const RecordsSummary: React.FC<RecordsSummaryProps> = ({ records }) => {
  const totalRides = records.length;
  const normalRides = records.filter((r) => r.status === 'alighted' || r.status === 'boarded').length;
  const manualRides = records.filter((r) => r.boardMethod === 'manual').length;
  const missingRides = records.filter((r) => r.status === 'missing').length;
  const completionRate = totalRides === 0 ? 0 : Math.round(((normalRides + manualRides) / totalRides) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="乘车总人次"
        value={totalRides}
        icon={<Users className="h-6 w-6" />}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        accentColor="info"
      />
      <StatCard
        title="正常刷卡"
        value={normalRides}
        icon={<CheckCircle2 className="h-6 w-6" />}
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
        accentColor="success"
      />
      <StatCard
        title="人工确认"
        value={manualRides}
        icon={<AlertTriangle className="h-6 w-6" />}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        accentColor="warning"
      />
      <StatCard
        title="乘车完成率"
        value={`${completionRate}%`}
        icon={<Clock className="h-6 w-6" />}
        iconBg="bg-slate-100"
        iconColor="text-slate-600"
        accentColor="primary"
      />
    </div>
  );
};

RecordsSummary.displayName = 'RecordsSummary';
