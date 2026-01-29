import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  createdAt: Date;
  isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  history: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  removeNotification: (id: string) => void;
  markAllAsRead: () => void;
  clearHistory: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  history: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { 
      ...notification, 
      id, 
      createdAt: new Date(),
      isRead: false 
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
      history: [newNotification, ...state.history].slice(0, 50), // Keep last 50
    }));

    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration || 5000);
    }
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  markAllAsRead: () => set((state) => ({
    history: state.history.map(n => ({ ...n, isRead: true }))
  })),
  clearHistory: () => set({ history: [] })
}));
