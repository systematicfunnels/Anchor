import React from 'react';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  intent?: 'primary' | 'danger';
  impact?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  intent = 'primary',
  impact,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              intent === 'danger' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-neutral-600 leading-relaxed">{message}</p>
              {impact && (
                <p className="mt-3 text-sm font-bold text-neutral-900 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                  Impact: {impact}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-neutral-50 border-t border-neutral-100">
          <Button 
            intent="secondary" 
            className="flex-1" 
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button 
            intent={intent} 
            className="flex-1" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
