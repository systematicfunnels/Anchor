import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  trigger: React.ReactNode;
  align?: 'left' | 'right';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, trigger, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }} 
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={clsx(
            'absolute z-[9999] mt-2 min-w-[160px] bg-white rounded-lg shadow-xl border border-neutral-100 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              disabled={item.disabled}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                item.variant === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-neutral-700 hover:bg-neutral-50',
                item.disabled && 'opacity-50 cursor-not-allowed grayscale'
              )}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
