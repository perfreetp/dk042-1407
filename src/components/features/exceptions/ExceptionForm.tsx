import * as React from 'react';
import { Modal, Button, Select, Textarea, StatusBadge } from '../../common';
import type { Student, ShiftType, BusRoute, BusStop } from '../../../types';
import { routes as allRoutes, stops as allStops, campuses } from '../../../data';
import { User, MapPin, Calendar, ShieldAlert } from 'lucide-react';

interface ExceptionFormProps {
  open: boolean;
  onClose: () => void;
  student: Student | null;
  onSubmit: (data: {
    reason: string;
    remark?: string;
    shift: ShiftType;
    routeId: string;
    date: string;
  }) => void;
}

const exceptionReasons = [
  '学生忘带乘车卡',
  '卡片消磁无法识别',
  '卡片丢失补办中',
  '临时换卡未激活',
  '机器故障未刷卡',
  '家长陪同乘车未带卡',
  '新学生尚未办卡',
  '其他原因',
];

const shiftOptions: { value: string; label: string }[] = [
  { value: 'morning', label: '早班（上学）' },
  { value: 'evening', label: '晚班（放学）' },
];

export const ExceptionForm: React.FC<ExceptionFormProps> = ({
  open,
  onClose,
  student,
  onSubmit,
}) => {
  const [reason, setReason] = React.useState('');
  const [remark, setRemark] = React.useState('');
  const [shift, setShift] = React.useState<ShiftType>('morning');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      const hour = new Date().getHours();
      setShift(hour < 12 ? 'morning' : 'evening');
      setReason('');
      setRemark('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!reason || !student) return;
    setSubmitting(true);
    setTimeout(() => {
      const route = allRoutes.find((r) => r.studentIds.includes(student.id)) ||
        allRoutes.find((r) => r.id === student.routeId);
      onSubmit({
        reason,
        remark: remark || undefined,
        shift,
        routeId: route?.id || student.routeId,
        date: new Date().toISOString().split('T')[0],
      });
      setSubmitting(false);
      onClose();
    }, 500);
  };

  if (!student) return null;

  const route: BusRoute | undefined = allRoutes.find((r) => r.id === student.routeId);
  const stop: BusStop | undefined = allStops.find((s) => s.id === student.assignedStopId);
  const campus = campuses.find((c) => c.id === route?.campusId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="人工确认上车登记"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button
            variant="secondary"
            onClick={handleSubmit}
            disabled={!reason || submitting}
            icon={<ShieldAlert className="h-4 w-4" />}
          >
            {submitting ? '提交中...' : '确认登记'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <User className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-semibold text-amber-900">{student.name}</h4>
                <StatusBadge variant="amber">学生</StatusBadge>
              </div>
              <div className="mt-2 space-y-1 text-xs text-amber-800/80">
                <p className="flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  {student.className} · 学号 {student.studentNo}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {campus?.name} · {route?.name} · {stop?.name}
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  今日 {new Date().toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">选择班次</label>
          <Select
            options={shiftOptions}
            value={shift}
            onChange={(v) => setShift(v as ShiftType)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">异常原因</label>
          <Select
            options={exceptionReasons.map((r) => ({ value: r, label: r }))}
            placeholder="请选择异常原因..."
            value={reason}
            onChange={setReason}
          />
        </div>

        <Textarea
          label="备注说明（选填）"
          placeholder="例如：家长已电话确认；学生临时由家长接送..."
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={3}
        />
      </div>
    </Modal>
  );
};

ExceptionForm.displayName = 'ExceptionForm';
