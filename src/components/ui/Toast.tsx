import React from 'react';
import { useNotificationStore, Notification } from '../../store/useNotificationStore';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export const ToastContainer: React.FC = () => {
  const { notifications } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { removeNotification } = useNotificationStore();

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100',
    warning: 'bg-amber-50 border-amber-100',
  };

  return (
    <div className={clsx(
      'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all animate-in slide-in-from-right-full',
      bgColors[notification.type]
    )}>
      {icons[notification.type]}
      <p className="text-sm font-medium text-neutral-800">{notification.message}</p>
      <button 
        onClick={() => removeNotification(notification.id)}
        className="ml-2 p-1 hover:bg-black/5 rounded transition-colors"
      >
        <X className="w-4 h-4 text-neutral-400" />
      </button>
    </div>
  );
};
