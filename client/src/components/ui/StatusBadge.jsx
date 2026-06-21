import { SHIPMENT_STATUSES } from '../../utils/constants';

export default function StatusBadge({ status }) {
  const config = SHIPMENT_STATUSES[status] || { label: status, color: 'bg-slate-500' };
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white ${config.color}`}>
      {config.label}
    </span>
  );
}
