import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, userAPI } from '@/lib/api-client';

// Profile type with role management — matches backend camelCase response
export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  fullName: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  isVerified: boolean;
  sellerModeEnabled: boolean;
  sellerVerified: boolean;
  sellerApplicationStatus: 'pending' | 'approved' | 'rejected' | null;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  stripeAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isBuyer: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  sellerModeEnabled: boolean;
  signOut: () => Promise<void>;
  toggleSellerMode: (enabled: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data } = await authAPI.getProfile();
      const userProfile = data.data.user;
      setUser(userProfile);
      setProfile(userProfile);
    } catch (error: any) {
      // Only log error if it's not 401 (unauthorized)
      if (error.response?.status !== 401) {
        console.error('Error fetching profile:', error);
      }
      setUser(null);
      setProfile(null);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    fetchProfile();
  }, []);

  // Sign out
  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setProfile(null);
    }
  };

  // Toggle seller mode
  const toggleSellerMode = async (enabled: boolean) => {
    if (!user) throw new Error('Not authenticated');

    try {
      // Call backend API to toggle seller mode
      await userAPI.toggleSellerMode(enabled);
      
      // Update local state immediately
      setUser(prev => prev ? { ...prev, sellerModeEnabled: enabled } : null);
      setProfile(prev => prev ? { ...prev, sellerModeEnabled: enabled } : null);
      
      // Refresh profile to get updated data from server
      await fetchProfile();
    } catch (error) {
      console.error('Error toggling seller mode:', error);
      // Revert on error
      await fetchProfile();
      throw error;
    }
  };

  // Refresh profile manually
  const refreshProfile = async () => {
    await fetchProfile();
  };

  // Computed properties
  const isAuthenticated = !!user;
  const isBuyer = user?.role === 'BUYER';
  const isSeller = user?.role === 'SELLER';
  const isAdmin = user?.role === 'ADMIN';
  const sellerModeEnabled = user?.sellerModeEnabled ?? false;

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated,
    isBuyer,
    isSeller,
    isAdmin,
    sellerModeEnabled,
    signOut,
    toggleSellerMode,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
