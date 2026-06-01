import { useState, useRef, useEffect, ReactNode } from 'react';
import { clsx } from 'clsx';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

const Dropdown = ({ trigger, children, align = 'left', className }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 mt-1 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  danger,
}: {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors',
      danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
    )}
  >
    {children}
  </button>
);

export const DropdownDivider = () => <div className="border-t border-gray-100" />;

export default Dropdown;
