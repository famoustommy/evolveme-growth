/**
 * Auth Store — Zustand
 *
 * 管理用户认证状态
 */
import { create } from 'zustand';
import type { Profile } from '@/types/database';
import {
  getCurrentSession,
  getCurrentUser,
  signUpWithEmail,
  signInWithEmail,
  signInWithApple,
  signInWithGoogle,
  signOut,
  onAuthStateChange,
} from '@/services/supabase';
import { getProfile } from '@/db/profiles';
import { setUserId as rcSetUserId, clearUserId as rcClearUserId } from '@/services/revenuecat';
import { setUserId as osSetUserId, logout as osLogout } from '@/services/onesignal';

// ============================================================================
// Types
// ============================================================================

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: { id: string; email: string | null } | null;
  profile: Profile | null;
  error: string | null;
}

interface AuthActions {
  // Bootstrap: called once on app start
  bootstrap: () => Promise<void>;
  // Email sign up
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  // Email sign in
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  // OAuth
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  // Sign out
  signOut: () => Promise<void>;
  // Refresh profile
  refreshProfile: () => Promise<void>;
  // Clear error
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// ============================================================================
// Store
// ============================================================================

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  status: 'loading',
  user: null,
  profile: null,
  error: null,

  // ============================================================================
  // Bootstrap — check existing session on app start
  // ============================================================================
  bootstrap: async () => {
    try {
      // Listen for auth state changes
      onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await getProfile();
          set({
            status: 'authenticated',
            user: { id: session.user.id, email: session.user.email },
            profile,
          });
        } else if (event === 'SIGNED_OUT') {
          set({
            status: 'unauthenticated',
            user: null,
            profile: null,
          });
        }
      });

      // Check existing session
      const session = await getCurrentSession();
      if (session?.user) {
        const profile = await getProfile();
        set({
          status: 'authenticated',
          user: { id: session.user.id, email: session.user.email },
          profile,
        });
      } else {
        set({ status: 'unauthenticated' });
      }
    } catch (err) {
      console.error('Auth: Bootstrap failed:', err);
      set({ status: 'unauthenticated' });
    }
  },

  // ============================================================================
  // Sign Up
  // ============================================================================
  signUp: async (email, password) => {
    set({ error: null });
    const { data, error } = await signUpWithEmail(email, password);

    if (error) {
      set({ error: getAuthErrorMessage(error.message) });
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    // User may need to confirm email
    if (data.user && !data.session) {
      return { success: true, error: undefined };
    }

    // Auto sign in if session returned
    if (data.session?.user) {
      const profile = await getProfile();
      set({
        status: 'authenticated',
        user: { id: data.session.user.id, email: data.session.user.email },
        profile,
      });
      await linkThirdPartyServices(data.session.user.id);
    }

    return { success: true };
  },

  // ============================================================================
  // Sign In
  // ============================================================================
  signIn: async (email, password) => {
    set({ error: null });
    const { data, error } = await signInWithEmail(email, password);

    if (error) {
      set({ error: getAuthErrorMessage(error.message) });
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    if (data.session?.user) {
      const profile = await getProfile();
      set({
        status: 'authenticated',
        user: { id: data.session.user.id, email: data.session.user.email },
        profile,
      });
      await linkThirdPartyServices(data.session.user.id);
    }

    return { success: true };
  },

  // ============================================================================
  // Apple Sign In
  // ============================================================================
  signInWithApple: async () => {
    set({ error: null });
    const { data, error } = await signInWithApple();

    if (error) {
      set({ error: getAuthErrorMessage(error.message) });
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    if (data.session?.user) {
      const profile = await getProfile();
      set({
        status: 'authenticated',
        user: { id: data.session.user.id, email: data.session.user.email },
        profile,
      });
      await linkThirdPartyServices(data.session.user.id);
    }

    return { success: true };
  },

  // ============================================================================
  // Google Sign In
  // ============================================================================
  signInWithGoogle: async () => {
    set({ error: null });
    const { data, error } = await signInWithGoogle();

    if (error) {
      set({ error: getAuthErrorMessage(error.message) });
      return { success: false, error: getAuthErrorMessage(error.message) };
    }

    if (data.session?.user) {
      const profile = await getProfile();
      set({
        status: 'authenticated',
        user: { id: data.session.user.id, email: data.session.user.email },
        profile,
      });
      await linkThirdPartyServices(data.session.user.id);
    }

    return { success: true };
  },

  // ============================================================================
  // Sign Out
  // ============================================================================
  signOut: async () => {
    const { user } = get();
    
    // Unlink third party services
    if (user) {
      await Promise.allSettled([
        rcClearUserId(),
        osLogout(),
      ]);
    }

    await signOut();
    set({
      status: 'unauthenticated',
      user: null,
      profile: null,
    });
  },

  // ============================================================================
  // Refresh Profile
  // ============================================================================
  refreshProfile: async () => {
    const profile = await getProfile();
    set({ profile });
  },

  // ============================================================================
  // Clear Error
  // ============================================================================
  clearError: () => {
    set({ error: null });
  },
}));

// ============================================================================
// Helpers
// ============================================================================

/** Link user ID to RevenueCat and OneSignal after login */
async function linkThirdPartyServices(userId: string): Promise<void> {
  await Promise.allSettled([
    rcSetUserId(userId),
    osSetUserId(userId),
  ]);
}

/** Convert Supabase error messages to user-friendly text */
function getAuthErrorMessage(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (message.includes('User already registered')) {
    return 'This email is already registered';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please confirm your email first';
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters';
  }
  if (message.includes('Unable to validate email address')) {
    return 'Invalid email address';
  }
  return 'Something went wrong. Please try again';
}
