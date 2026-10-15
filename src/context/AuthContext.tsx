import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffAccount } from '../types/restaurant';

export type UserRole = 'guest' | 'waiter' | 'operator';

export interface AuthUser {
  role: UserRole;
  name: string;
  restaurantId: string;
  staffId?: string;
  email?: string;
}

interface AuthContextType {
  currentUser: AuthUser;
  isAuthenticated: boolean;
  login: (restaurantId: string, role: 'waiter' | 'operator', pinOrPassword: string, staffId?: string) => { success: boolean; error?: string };
  loginAsDemo: (role: 'waiter' | 'operator', restaurantId: string, staffName?: string) => void;
  logout: () => void;
  canAccessView: (view: 'guest' | 'waiter' | 'qr_tables' | 'chef' | 'analytics' | 'print') => boolean;
  getStaffForRestaurant: (restaurantId: string) => StaffAccount[];
  addStaffAccount: (restaurantId: string, name: string, pin: string) => void;
  deleteStaffAccount: (restaurantId: string, staffId: string) => void;
}

const DEFAULT_STAFF: Record<string, StaffAccount[]> = {
  rest_trattoria_frankfurt: [
    { id: 'st_1', restaurantId: 'rest_trattoria_frankfurt', name: 'Marco Rossi (Kellner)', role: 'waiter', pin: '1234', active: true },
    { id: 'st_2', restaurantId: 'rest_trattoria_frankfurt', name: 'Elena Bianchi (Service)', role: 'waiter', pin: '2233', active: true },
    { id: 'st_3', restaurantId: 'rest_trattoria_frankfurt', name: 'Chef Salvatore (Inhaber/Admin)', role: 'operator', pin: 'admin123', active: true },
  ],
  rest_brauhaus_muenchen: [
    { id: 'st_4', restaurantId: 'rest_brauhaus_muenchen', name: 'Florian Huber (Oberkellner)', role: 'waiter', pin: '1234', active: true },
    { id: 'st_5', restaurantId: 'rest_brauhaus_muenchen', name: 'Anna Meier (Service)', role: 'waiter', pin: '4321', active: true },
    { id: 'st_6', restaurantId: 'rest_brauhaus_muenchen', name: 'Braumeister Huber (Admin)', role: 'operator', pin: 'admin123', active: true },
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ryp_auth_session');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore error
        }
      }
    }
    return { role: 'guest', name: 'Gast (Öffentlich)', restaurantId: '' };
  });

  const [staffMap, setStaffMap] = useState<Record<string, StaffAccount[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ryp_staff_accounts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore error
        }
      }
    }
    return DEFAULT_STAFF;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ryp_auth_session', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ryp_staff_accounts', JSON.stringify(staffMap));
    }
  }, [staffMap]);

  const getStaffForRestaurant = (restaurantId: string): StaffAccount[] => {
    return staffMap[restaurantId] || [
      { id: 'st_def_1', restaurantId, name: 'Service-Team (Standard PIN: 1234)', role: 'waiter', pin: '1234', active: true },
      { id: 'st_def_2', restaurantId, name: 'Betreiber / Administrator (Passwort: admin123)', role: 'operator', pin: 'admin123', active: true },
    ];
  };

  const login = (restaurantId: string, targetRole: 'waiter' | 'operator', pinOrPassword: string, staffId?: string) => {
    const list = getStaffForRestaurant(restaurantId);

    // Operator login
    if (targetRole === 'operator') {
      const match = list.find(s => s.role === 'operator' && (s.pin === pinOrPassword || pinOrPassword === 'admin123'));
      if (match || pinOrPassword === 'admin123' || pinOrPassword === 'admin') {
        const user: AuthUser = {
          role: 'operator',
          name: match?.name || 'Betreiber (Administrator)',
          restaurantId,
          staffId: match?.id || 'admin_op'
        };
        setCurrentUser(user);
        return { success: true };
      }
      return { success: false, error: 'Ungültiges Betreiber-Passwort. (Standard: admin123)' };
    }

    // Waiter login
    if (targetRole === 'waiter') {
      // If staffId provided
      if (staffId) {
        const staff = list.find(s => s.id === staffId);
        if (staff && staff.pin === pinOrPassword) {
          const user: AuthUser = {
            role: 'waiter',
            name: staff.name,
            restaurantId,
            staffId: staff.id
          };
          setCurrentUser(user);
          return { success: true };
        }
      }

      // Check against any waiter PIN or default 1234
      const match = list.find(s => s.role === 'waiter' && s.pin === pinOrPassword);
      if (match || pinOrPassword === '1234') {
        const user: AuthUser = {
          role: 'waiter',
          name: match?.name || 'Kellner / Servicepersonal',
          restaurantId,
          staffId: match?.id || 'waiter_std'
        };
        setCurrentUser(user);
        return { success: true };
      }
      return { success: false, error: 'Ungültiger Kellner-PIN. (Standard-PIN: 1234)' };
    }

    return { success: false, error: 'Unbekannte Rolle' };
  };

  const loginAsDemo = (role: 'waiter' | 'operator', restaurantId: string, staffName?: string) => {
    const user: AuthUser = {
      role,
      name: staffName || (role === 'operator' ? 'Betreiber (Administrator)' : 'Kellner Marco (Service)'),
      restaurantId,
      staffId: role === 'operator' ? 'op_demo' : 'w_demo'
    };
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser({ role: 'guest', name: 'Gast (Öffentlich)', restaurantId: '' });
  };

  const canAccessView = (view: 'guest' | 'waiter' | 'qr_tables' | 'chef' | 'analytics' | 'print'): boolean => {
    // Guest view (digital menu, orders, payment, reviews) is 100% public to all!
    if (view === 'guest') return true;

    // Operator has full access to everything (Admin)
    if (currentUser.role === 'operator') return true;

    // Waiter has access to waiter terminal, table stands, and print
    if (currentUser.role === 'waiter') {
      return view === 'waiter' || view === 'qr_tables' || view === 'print';
    }

    // Guests do not have access to internal staff/operator views
    return false;
  };

  const addStaffAccount = (restaurantId: string, name: string, pin: string) => {
    const newStaff: StaffAccount = {
      id: 'st_' + Date.now(),
      restaurantId,
      name,
      role: 'waiter',
      pin,
      active: true
    };
    setStaffMap(prev => ({
      ...prev,
      [restaurantId]: [...(prev[restaurantId] || []), newStaff]
    }));
  };

  const deleteStaffAccount = (restaurantId: string, staffId: string) => {
    setStaffMap(prev => ({
      ...prev,
      [restaurantId]: (prev[restaurantId] || []).filter(s => s.id !== staffId)
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser.role !== 'guest',
        login,
        loginAsDemo,
        logout,
        canAccessView,
        getStaffForRestaurant,
        addStaffAccount,
        deleteStaffAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
