import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ContextMenuProps {
  items: MenuItem[];
  children: React.ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, children }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setVisible(true);
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    setVisible(false);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    if (visible) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [visible]);

  return (
    <div onContextMenu={handleContextMenu} className="relative">
      {children}
      {visible && (
        <div
          ref={menuRef}
          className="fixed z-[200] min-w-[160px] bg-white rounded-lg shadow-xl border border-neutral-100 py-1 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: position.y, left: position.x }}
          onClick={handleClick}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                if (!item.disabled) {
                  item.onClick();
                  setVisible(false);
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
