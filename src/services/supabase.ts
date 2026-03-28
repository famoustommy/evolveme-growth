/**
 * Supabase 客户端配置
 * 
 * 提供统一的 Supabase 访问接口，支持：
 * - 认证 (Auth)
 * - 数据库 (Database)
 * - 存储 (Storage)
 * - 实时订阅 (Realtime)
 * - Edge Functions
 */
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';

const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Supabase: Missing URL or ANON_KEY. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

// ============================================================================
// CLIENT
// ============================================================================

/**
 * Supabase 客户端实例
 * 
 * 使用 AsyncStorage 作为存储适配器，支持持久化登录状态
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage as never,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================================================
// AUTH HELPERS
// ============================================================================

/**
 * 获取当前用户会话
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Supabase: Failed to get session:', error.message);
    return null;
  }
  return data.session;
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Supabase: Failed to get user:', error.message);
    return null;
  }
  return data.user;
};

/**
 * 使用邮箱密码注册
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

/**
 * 使用邮箱密码登录
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

/**
 * 使用 Apple 登录 (出海必备)
 */
export const signInWithApple = async () => {
  const { data, error } = await supabase.auth.signInWithApple();
  return { data, error };
};

/**
 * 使用 Google 登录
 */
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  return { data, error };
};

/**
 * 登出
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase: Failed to sign out:', error.message);
  }
  return { error };
};

// ============================================================================
// AUTH STATE LISTENER
// ============================================================================

type AuthStateCallback = (event: string, session: typeof supabase.auth.currentSession) => void;

/**
 * 监听认证状态变化
 * @param callback 认证状态变化回调
 * @returns 取消订阅函数
 */
export const onAuthStateChange = (callback: AuthStateCallback) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (__DEV__) {
      console.log('🔐 Auth state changed:', event);
    }
    callback(event, session);
  });

  return () => data.subscription.unsubscribe();
};

export default supabase;
