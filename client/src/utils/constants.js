export const SHIPMENT_STATUSES = {
  pending: { label: 'Pending', color: 'bg-slate-500' },
  picked_up: { label: 'Picked Up', color: 'bg-blue-500' },
  in_warehouse: { label: 'In Warehouse', color: 'bg-indigo-500' },
  in_transit: { label: 'In Transit', color: 'bg-amber-500' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  delayed: { label: 'Delayed', color: 'bg-red-500' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500' },
};

export const STATUS_ORDER = [
  'pending',
  'picked_up',
  'in_warehouse',
  'in_transit',
  'out_for_delivery',
  'delivered',
];

export const PACKAGE_TYPES = ['document', 'parcel', 'fragile', 'electronics', 'other'];
export const DELIVERY_SPEEDS = [
  { value: 'standard', label: 'Standard (3-5 days)' },
  { value: 'express', label: 'Express (1-2 days)' },
  { value: 'same-day', label: 'Same Day' },
];

export const ROLE_DASHBOARD = {
  customer: '/dashboard/customer',
  driver: '/dashboard/driver',
  admin: '/dashboard/admin',
  warehouse: '/dashboard/warehouse',
};
