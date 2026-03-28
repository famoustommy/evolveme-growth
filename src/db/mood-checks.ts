/**
 * Supabase 数据库操作层 — Mood Checks
 *
 * 心情打卡的 CRUD 操作
 */
import { supabase } from '@/services/supabase';
import type { MoodCheck, MoodCheckInsert, MoodCount } from '@/types/database';

// ============================================================================
// Queries
// ============================================================================

/**
 * 获取今日打卡记录
 */
export const getTodayMoodCheck = async (): Promise<MoodCheck | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('mood_checks')
    .select('*')
    .eq('user_id', user.id)
    .gte('checked_at', today)
    .lt('checked_at', `${today}T23:59:59`)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('MoodCheck: Failed to get today check:', error.message);
  }
  return data ?? null;
};

/**
 * 提交心情打卡（今天只能打一次）
 */
export const submitMoodCheck = async (insert: MoodCheckInsert): Promise<MoodCheck | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('mood_checks')
    .insert({
      ...insert,
      user_id: user.id,
      checked_at: insert.checked_at || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('MoodCheck: Failed to submit:', error.message);
    return null;
  }
  return data;
};

/**
 * 获取某周的心情记录
 */
export const getWeeklyMoodChecks = async (weekStart: string): Promise<MoodCheck[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { data, error } = await supabase
    .from('mood_checks')
    .select('*')
    .eq('user_id', user.id)
    .gte('checked_at', weekStart)
    .lt('checked_at', weekEnd.toISOString())
    .order('checked_at', { ascending: true });

  if (error) {
    console.error('MoodCheck: Failed to get weekly checks:', error.message);
    return [];
  }
  return data ?? [];
};

/**
 * 获取心情分布统计（指定时间范围）
 */
export const getMoodStats = async (startDate: string, endDate: string): Promise<MoodCount[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('mood_checks')
    .select('mood')
    .eq('user_id', user.id)
    .gte('checked_at', startDate)
    .lt('checked_at', endDate);

  if (error) {
    console.error('MoodCheck: Failed to get mood stats:', error.message);
    return [];
  }

  // Aggregate in JS (simpler than raw SQL for now)
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const item of data ?? []) {
    counts[item.mood]++;
  }

  return Object.entries(counts).map(([mood, count]) => ({
    mood: Number(mood) as MoodCheck['mood'],
    count,
  }));
};
