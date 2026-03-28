/**
 * Supabase 数据库操作层 — Tags
 *
 * 标签的 CRUD 操作
 */
import { supabase } from '@/services/supabase';
import type { Tag, TagInsert } from '@/types/database';

// ============================================================================
// Queries
// ============================================================================

/**
 * 获取用户所有标签
 */
export const getTags = async (): Promise<Tag[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) {
    console.error('Tag: Failed to get tags:', error.message);
    return [];
  }
  return data ?? [];
};

/**
 * 创建标签
 */
export const createTag = async (insert: TagInsert): Promise<Tag | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('tags')
    .insert({
      ...insert,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Tag: Failed to create:', error.message);
    return null;
  }
  return data;
};

/**
 * 删除标签
 */
export const deleteTag = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Tag: Failed to delete:', error.message);
    return false;
  }
  return true;
};

// ============================================================================
// Diary-Tag Relation
// ============================================================================

/**
 * 给日记添加标签
 */
export const addTagToDiary = async (diaryId: string, tagId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('diary_tags')
    .insert({ diary_id: diaryId, tag_id: tagId });

  if (error) {
    // Ignore duplicate key error
    if (error.code !== '23505') {
      console.error('Tag: Failed to add tag to diary:', error.message);
      return false;
    }
  }
  return true;
};

/**
 * 从日记移除标签
 */
export const removeTagFromDiary = async (diaryId: string, tagId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('diary_tags')
    .delete()
    .eq('diary_id', diaryId)
    .eq('tag_id', tagId);

  if (error) {
    console.error('Tag: Failed to remove tag from diary:', error.message);
    return false;
  }
  return true;
};
