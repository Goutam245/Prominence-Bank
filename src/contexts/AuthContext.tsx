import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Customer } from '@/types/banking';
import { initializeData, dataStore } from '@/lib/dataStore';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsOtp?: boolean }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  completeOtpLogin: () => void;
  pendingUser: User | null;
  impersonating: Customer | null;
  startImpersonation: (customer: Customer) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users
const demoUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@prominencebank.com',
    name: 'Sarah Mitchell',
    role: 'admin',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'client-1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'client',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'client-2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'client',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    createdAt: '2024-05-20T00:00:00Z',
  },
  {
    id: 'client-3',
    email: 'gmg.group@example.com',
    name: 'GMG Group Ltd',
    role: 'client',
    createdAt: '2024-01-10T00:00:00Z',
  },
];

// Demo credentials
const DEMO_CREDENTIALS: Record<string, string> = {
  'admin@prominencebank.com': 'Admin@123',
  'john.doe@example.com': 'Client@123',
  'jane.smith@example.com': 'Client@456',
  'gmg.group@example.com': 'Client@789',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [impersonating, setImpersonating] = useState<Customer | null>(null);

  useEffect(() => {
    initializeData();
    const storedUser = localStorage.getItem('prominence_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'client') {
        const customers = dataStore.getCustomers();
        const foundCustomer = customers.find(c => c.email === parsedUser.email);
        setCustomer(foundCustomer || null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; needsOtp?: boolean }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const correctPassword = DEMO_CREDENTIALS[email];
    if (!correctPassword) {
      setIsLoading(false);
      return { success: false, error: 'Account not found. Please check your email.' };
    }
    if (password !== correctPassword) {
      setIsLoading(false);
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const foundUser = demoUsers.find(u => u.email === email);
    if (!foundUser) {
      setIsLoading(false);
      return { success: false, error: 'An error occurred.' };
    }

    // Admin goes directly, clients need OTP
    if (foundUser.role === 'admin') {
      setUser(foundUser);
      localStorage.setItem('prominence_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return { success: true };
    }

    // Client needs OTP
    setPendingUser(foundUser);
    setIsLoading(false);
    return { success: true, needsOtp: true };
  };

  const completeOtpLogin = () => {
    if (pendingUser) {
      setUser(pendingUser);
      localStorage.setItem('prominence_user', JSON.stringify(pendingUser));
      if (pendingUser.role === 'client') {
        const customers = dataStore.getCustomers();
        const foundCustomer = customers.find(c => c.email === pendingUser.email);
        setCustomer(foundCustomer || null);
      }
      setPendingUser(null);
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    const googleUser = demoUsers.find(u => u.email === 'john.doe@example.com');
    if (googleUser) {
      setPendingUser(googleUser);
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, error: 'Google sign-in failed.' };
  };

  const logout = () => {
    setUser(null);
    setCustomer(null);
    setPendingUser(null);
    setImpersonating(null);
    localStorage.removeItem('prominence_user');
  };

  const startImpersonation = (c: Customer) => setImpersonating(c);
  const stopImpersonation = () => setImpersonating(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        customer: impersonating ? impersonating : customer,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        logout,
        completeOtpLogin,
        pendingUser,
        impersonating,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
