/**
 * Supabase 数据库操作层 — Tasks
 *
 * 每日任务的 CRUD 操作
 */
import { supabase } from '@/services/supabase';
import type { Task, TaskInsert, TaskUpdate } from '@/types/database';

// ============================================================================
// Queries
// ============================================================================

/**
 * 获取某天的任务列表
 */
export const getTasksByDate = async (date: string): Promise<Task[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('task_date', date)
    .order('is_completed', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Task: Failed to get tasks:', error.message);
    return [];
  }
  return data ?? [];
};

/**
 * 获取今日任务
 */
export const getTodayTasks = async (): Promise<Task[]> => {
  const today = new Date().toISOString().split('T')[0];
  return getTasksByDate(today);
};

/**
 * 获取今日任务统计
 */
export const getTodayTaskStats = async (): Promise<{ done: number; total: number }> => {
  const tasks = await getTodayTasks();
  return {
    done: tasks.filter(t => t.is_completed).length,
    total: tasks.length,
  };
};

/**
 * 创建任务
 */
export const createTask = async (insert: TaskInsert): Promise<Task | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...insert,
      user_id: user.id,
      task_date: insert.task_date || new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('Task: Failed to create:', error.message);
    return null;
  }
  return data;
};

/**
 * 切换任务完成状态
 */
export const toggleTask = async (id: string, isCompleted: boolean): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Task: Failed to toggle:', error.message);
    return null;
  }
  return data;
};

/**
 * 更新任务
 */
export const updateTask = async (id: string, updates: TaskUpdate): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Task: Failed to update:', error.message);
    return null;
  }
  return data;
};

/**
 * 删除任务
 */
export const deleteTask = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Task: Failed to delete:', error.message);
    return false;
  }
  return true;
};

/**
 * 获取本周任务完成统计
 */
export const getWeeklyTaskStats = async (): Promise<{ completed: number; total: number }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { completed: 0, total: 0 };

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('tasks')
    .select('id, is_completed')
    .eq('user_id', user.id)
    .gte('task_date', weekStart.toISOString().split('T')[0]);

  if (error) {
    console.error('Task: Failed to get weekly stats:', error.message);
    return { completed: 0, total: 0 };
  }

  const tasks = data ?? [];
  return {
    completed: tasks.filter(t => t.is_completed).length,
    total: tasks.length,
  };
};
