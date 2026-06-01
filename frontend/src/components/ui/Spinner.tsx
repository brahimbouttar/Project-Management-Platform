import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  className?: string;
}

const Spinner = ({ size = 24, className }: SpinnerProps) => (
  <Loader2 className={clsx('animate-spin text-indigo-600', className)} size={size} />
);

export const PageSpinner = () => (
  <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
    <Spinner size={40} />
  </div>
);

export default Spinner;
