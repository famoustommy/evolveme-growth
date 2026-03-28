/**
 * Supabase 数据库操作层 — Plans
 *
 * 计划的 CRUD 操作
 */
import { supabase } from '@/services/supabase';
import type { Plan, PlanInsert, PlanUpdate, PlanStatus, Milestone, MilestoneInsert, MilestoneUpdate } from '@/types/database';

// ============================================================================
// Plan Queries
// ============================================================================

/**
 * 获取计划列表（按状态筛选）
 */
export const getPlans = async (status?: PlanStatus): Promise<Plan[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('plans')
    .select('*, milestones(*)')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Plan: Failed to get plans:', error.message);
    return [];
  }
  return data ?? [];
};

/**
 * 获取单个计划详情（含里程碑和任务）
 */
export const getPlanById = async (id: string): Promise<Plan | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('plans')
    .select('*, milestones(*), tasks(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Plan: Failed to get plan:', error.message);
    return null;
  }
  return data;
};

/**
 * 创建计划
 */
export const createPlan = async (insert: PlanInsert): Promise<Plan | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get max sort_order
  const { data: maxOrder } = await supabase
    .from('plans')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxOrder?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('plans')
    .insert({
      ...insert,
      user_id: user.id,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    console.error('Plan: Failed to create:', error.message);
    return null;
  }
  return data;
};

/**
 * 更新计划
 */
export const updatePlan = async (id: string, updates: PlanUpdate): Promise<Plan | null> => {
  const { data, error } = await supabase
    .from('plans')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Plan: Failed to update:', error.message);
    return null;
  }
  return data;
};

/**
 * 删除计划
 */
export const deletePlan = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Plan: Failed to delete:', error.message);
    return false;
  }
  return true;
};

// ============================================================================
// Milestone Queries
// ============================================================================

/**
 * 获取计划的里程碑列表
 */
export const getMilestones = async (planId: string): Promise<Milestone[]> => {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('plan_id', planId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Milestone: Failed to get milestones:', error.message);
    return [];
  }
  return data ?? [];
};

/**
 * 添加里程碑
 */
export const createMilestone = async (planId: string, insert: MilestoneInsert): Promise<Milestone | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Verify ownership via plan
  const { data: plan } = await supabase
    .from('plans')
    .select('id')
    .eq('id', planId)
    .eq('user_id', user.id)
    .single();

  if (!plan) return null;

  const { data, error } = await supabase
    .from('milestones')
    .insert({
      ...insert,
      plan_id: planId,
    })
    .select()
    .single();

  if (error) {
    console.error('Milestone: Failed to create:', error.message);
    return null;
  }

  // Auto-update plan progress
  await recalculatePlanProgress(planId);

  return data;
};

/**
 * 更新里程碑
 */
export const updateMilestone = async (id: string, updates: MilestoneUpdate): Promise<Milestone | null> => {
  const updateData: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (updates.is_completed) {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('milestones')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Milestone: Failed to update:', error.message);
    return null;
  }

  // Auto-update plan progress
  if (data) {
    await recalculatePlanProgress(data.plan_id);
  }

  return data;
};

/**
 * 删除里程碑
 */
export const deleteMilestone = async (id: string): Promise<boolean> => {
  const { data: milestone } = await supabase
    .from('milestones')
    .select('plan_id')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Milestone: Failed to delete:', error.message);
    return false;
  }

  if (milestone) {
    await recalculatePlanProgress(milestone.plan_id);
  }
  return true;
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * 重新计算计划进度（基于已完成里程碑百分比）
 */
async function recalculatePlanProgress(planId: string): Promise<void> {
  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, is_completed')
    .eq('plan_id', planId);

  if (!milestones || milestones.length === 0) return;

  const completed = milestones.filter(m => m.is_completed).length;
  const progress = Math.round((completed / milestones.length) * 100);

  await supabase
    .from('plans')
    .update({
      progress,
      status: progress === 100 ? 'completed' : 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', planId);
}
