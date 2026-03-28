/**
 * Supabase 数据库操作层 — Diaries
 *
 * 日记的 CRUD 操作
 */
import { supabase } from '@/services/supabase';
import type { Diary, DiaryInsert, DiaryUpdate, Tag } from '@/types/database';

// ============================================================================
// Queries
// ============================================================================

/**
 * 获取日记列表（分页）
 */
export const getDiaries = async (options?: {
  page?: number;
  pageSize?: number;
  search?: string;
  tagId?: string;
  bookmarkedOnly?: boolean;
}): Promise<{ data: Diary[]; count: number }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], count: 0 };

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('diaries')
    .select('*, tags:diary_tags(tag_id, tags(id, name, color))', { count: 'exact' })
    .eq('user_id', user.id)
    .order('diary_date', { ascending: false })
    .range(from, to);

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
  }
  if (options?.tagId) {
    query = query.contains('tags', [{ tag_id: options.tagId }]);
  }
  if (options?.bookmarkedOnly) {
    query = query.eq('is_bookmarked', true);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Diary: Failed to get diaries:', error.message);
    return { data: [], count: 0 };
  }

  // Transform tags relation
  const transformed = (data ?? []).map(transformDiaryWithTags);
  return { data: transformed, count: count ?? 0 };
};

/**
 * 获取单篇日记详情
 */
export const getDiaryById = async (id: string): Promise<Diary | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('diaries')
    .select('*, tags:diary_tags(tag_id, tags(id, name, color)), photos:diary_photos(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Diary: Failed to get diary:', error.message);
    return null;
  }
  return data ? transformDiaryWithTags(data) : null;
};

/**
 * 创建日记
 */
export const createDiary = async (insert: DiaryInsert): Promise<Diary | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('diaries')
    .insert({
      ...insert,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Diary: Failed to create:', error.message);
    return null;
  }
  return data;
};

/**
 * 更新日记
 */
export const updateDiary = async (id: string, updates: DiaryUpdate): Promise<Diary | null> => {
  const { data, error } = await supabase
    .from('diaries')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Diary: Failed to update:', error.message);
    return null;
  }
  return data;
};

/**
 * 删除日记
 */
export const deleteDiary = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('diaries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Diary: Failed to delete:', error.message);
    return false;
  }
  return true;
};

/**
 * 获取本月日记数量
 */
export const getMonthlyDiaryCount = async (): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('diaries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('diary_date', monthStart.toISOString().split('T')[0]);

  if (error) {
    console.error('Diary: Failed to get monthly count:', error.message);
    return 0;
  }
  return count ?? 0;
};

// ============================================================================
// Helpers
// ============================================================================

/** Transform Supabase relation format to flat tags array */
function transformDiaryWithTags(raw: Record<string, unknown>): Diary {
  const diary = { ...raw } as Diary;
  const tagsRaw = raw.tags as Array<{ tag_id: string; tags: Tag }> | null;
  if (tagsRaw) {
    diary.tags = tagsRaw.map(t => t.tags);
  }
  return diary;
}
