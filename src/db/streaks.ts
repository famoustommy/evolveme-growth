/**
 * Supabase 数据库操作层 — Streaks
 *
 * 连续打卡记录管理
 */
import { supabase } from '@/services/supabase';
import type { Streak } from '@/types/database';

// ============================================================================
// Queries
// ============================================================================

/**
 * 获取当前连续打卡记录
 */
export const getStreak = async (): Promise<Streak | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Streak: Failed to get streak:', error.message);
  }
  return data ?? null;
};

/**
 * 更新打卡连续天数
 * 在心情打卡后调用，自动计算连续天数
 */
export const updateStreakAfterCheckIn = async (): Promise<Streak | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  // Get current streak record
  const { data: current } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single();

  let currentStreak = 1;
  let longestStreak = 0;

  if (current) {
    const lastDate = current.last_check_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      // Consecutive day
      currentStreak = current.current_streak + 1;
    } else if (lastDate === today) {
      // Already checked in today, keep current
      currentStreak = current.current_streak;
    } else {
      // Streak broken
      currentStreak = 1;
    }
    longestStreak = Math.max(current.longest_streak, currentStreak);
  }

  const { data, error } = await supabase
    .from('streaks')
    .upsert({
      user_id: user.id,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_check_date: today,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Streak: Failed to update streak:', error.message);
    return null;
  }
  return data;
};
