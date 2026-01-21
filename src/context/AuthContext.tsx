import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, User, AccessLevel } from '../types/auth';
import { SCREEN_ACCESS_MATRIX } from '../constants/rbac';

interface AuthContextType {
  user: User;
  setRole: (role: UserRole) => void;
  getAccessLevel: (screenName: string) => AccessLevel;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: '1',
    name: 'Hemant Chaudhary',
    role: 'Architect', // Default role
  });

  const setRole = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
  };

  const getAccessLevel = (screenName: string): AccessLevel => {
    return SCREEN_ACCESS_MATRIX[user.role][screenName] || 'NO_ACCESS';
  };

  return (
    <AuthContext.Provider value={{ user, setRole, getAccessLevel }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
