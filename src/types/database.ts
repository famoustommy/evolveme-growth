/**
 * 数据库类型定义
 *
 * 与 Supabase 数据库表结构一一对应
 * 用于类型安全的数据库操作
 */

// ============================================================================
// Base Types
// ============================================================================

/** 心情等级：1😢 2😔 3😐 4🙂 5😄 */
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

/** 计划状态 */
export type PlanStatus = 'active' | 'completed' | 'archived' | 'paused';

/** 重复类型 */
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

/** 任务优先级 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// ============================================================================
// Database Row Types
// ============================================================================

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  timezone: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  timezone?: string;
  locale?: string;
}

export interface MoodCheck {
  id: string;
  user_id: string;
  mood: MoodLevel;
  note: string | null;
  checked_at: string;
  created_at: string;
}

export interface MoodCheckInsert {
  mood: MoodLevel;
  note?: string | null;
  checked_at?: string;
}

export interface Diary {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: MoodLevel | null;
  is_bookmarked: boolean;
  word_count: number;
  diary_date: string;
  created_at: string;
  updated_at: string;
  // Joined from relations
  tags?: Tag[];
  photos?: DiaryPhoto[];
}

export interface DiaryInsert {
  title: string;
  content?: string;
  mood?: MoodLevel | null;
  is_bookmarked?: boolean;
  diary_date?: string;
}

export interface DiaryUpdate {
  title?: string;
  content?: string;
  mood?: MoodLevel | null;
  is_bookmarked?: boolean;
}

export interface DiaryPhoto {
  id: string;
  diary_id: string;
  storage_path: string;
  order_index: number;
  created_at: string;
}

export interface DiaryPhotoInsert {
  storage_path: string;
  order_index?: number;
}

export interface Plan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  status: PlanStatus;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  repeat_type: RepeatType;
  repeat_config: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined
  milestones?: Milestone[];
  tasks?: Task[];
}

export interface PlanInsert {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: PlanStatus;
  start_date?: string | null;
  due_date?: string | null;
  repeat_type?: RepeatType;
  repeat_config?: Record<string, unknown>;
}

export interface PlanUpdate {
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: PlanStatus;
  progress?: number;
  start_date?: string | null;
  due_date?: string | null;
  repeat_type?: RepeatType;
  repeat_config?: Record<string, unknown>;
}

export interface Milestone {
  id: string;
  plan_id: string;
  title: string;
  description: string;
  is_completed: boolean;
  due_date: string | null;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MilestoneInsert {
  title: string;
  description?: string;
  due_date?: string | null;
  sort_order?: number;
}

export interface MilestoneUpdate {
  title?: string;
  description?: string;
  is_completed?: boolean;
  due_date?: string | null;
  sort_order?: number;
}

export interface Task {
  id: string;
  user_id: string;
  plan_id: string | null;
  title: string;
  is_completed: boolean;
  task_date: string;
  priority: TaskPriority;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
}

export interface TaskInsert {
  title: string;
  plan_id?: string | null;
  task_date?: string;
  priority?: TaskPriority;
  sort_order?: number;
}

export interface TaskUpdate {
  title?: string;
  is_completed?: boolean;
  priority?: TaskPriority;
  sort_order?: number;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TagInsert {
  name: string;
  color?: string;
}

export interface DiaryTag {
  diary_id: string;
  tag_id: string;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_date: string | null;
  updated_at: string;
}

// ============================================================================
// Stats / Aggregation Types
// ============================================================================

export interface WeeklyStats {
  mood_trend: Array<{ date: string; mood: MoodLevel }>;
  diary_count: number;
  tasks_completed: number;
  tasks_total: number;
  streak_days: number;
  longest_streak: number;
}

export interface MoodCount {
  mood: MoodLevel;
  count: number;
}

export interface DaySummary {
  date: string;
  mood: MoodLevel | null;
  diary_count: number;
  tasks_done: number;
  tasks_total: number;
}

// ============================================================================
// Helper: Mood emoji mapping
// ============================================================================

export const MOOD_EMOJI: Record<MoodLevel, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😄',
};

export const MOOD_LABEL: Record<MoodLevel, string> = {
  1: 'Terrible',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};
