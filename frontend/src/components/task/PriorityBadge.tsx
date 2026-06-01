import type { Priority } from '../../types';
import Badge from '../ui/Badge';

const priorityConfig: Record<Priority, { variant: 'danger' | 'warning' | 'info' | 'default'; label: string }> = {
  urgent: { variant: 'danger', label: 'Urgent' },
  high: { variant: 'warning', label: 'High' },
  medium: { variant: 'info', label: 'Medium' },
  low: { variant: 'default', label: 'Low' },
};

interface PriorityBadgeProps {
  priority: Priority;
}

const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const config = priorityConfig[priority] || priorityConfig.medium;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default PriorityBadge;
