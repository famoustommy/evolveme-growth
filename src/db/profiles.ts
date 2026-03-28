/**
 * Supabase 数据库操作层 — Profiles
 *
 * 用户档案的 CRUD 操作
 */
import { supabase } from '@/services/supabase';
import type { Profile, ProfileInsert } from '@/types/database';

// ============================================================================
// Queries
// ============================================================================

/**
 * 获取当前用户 profile
 */
export const getProfile = async (): Promise<Profile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Profile: Failed to get profile:', error.message);
    return null;
  }
  return data;
};

/**
 * 更新当前用户 profile
 */
export const updateProfile = async (updates: ProfileInsert): Promise<Profile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Profile: Failed to update profile:', error.message);
    return null;
  }
  return data;
};
