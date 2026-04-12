import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'active' | 'completed' | 'pending' | 'rejected' | 'suspended' | 'frozen' | 'closed' | 'hold' | 'released' | 'info' | 'processing';

const variantClasses: Record<BadgeVariant, string> = {
  active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  released: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  hold: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  suspended: 'bg-orange-100 text-orange-700 border-orange-200',
  frozen: 'bg-slate-100 text-slate-700 border-slate-200',
  closed: 'bg-gray-100 text-gray-500 border-gray-200',
};

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

function mapStatusToVariant(status: string): BadgeVariant {
  const s = status.toLowerCase();
  if (['active', 'approved'].includes(s)) return 'active';
  if (['completed', 'released', 'paid', 'resolved'].includes(s)) return 'completed';
  if (['pending', 'hold', 'open', 'submitted', 'under_review'].includes(s)) return 'pending';
  if (['rejected', 'failed', 'cancelled', 'overdue'].includes(s)) return 'rejected';
  if (['suspended'].includes(s)) return 'suspended';
  if (['frozen'].includes(s)) return 'frozen';
  if (['closed', 'expired', 'inactive'].includes(s)) return 'closed';
  if (['processing', 'in_progress', 'in progress'].includes(s)) return 'processing';
  return 'info';
}

const StatusBadge = React.memo(function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const v = variant || mapStatusToVariant(status);
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize',
      variantClasses[v],
      className
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  );
});

export default StatusBadge;
