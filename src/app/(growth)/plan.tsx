/**
 * 计划管理 - 真实数据版
 *
 * V1.0.0.4: 接入 Supabase 数据库
 */
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlans, deletePlan } from '@/db/plans';
import type { Plan, PlanStatus } from '@/types/database';

// ============================================================================
// Filter Tabs
// ============================================================================

const FILTER_TABS: { label: string; status?: PlanStatus }[] = [
  { label: 'Active', status: 'active' },
  { label: 'Completed', status: 'completed' },
  { label: 'Archived', status: 'archived' },
];

// ============================================================================
// Components
// ============================================================================

function PlanCard({
  plan,
  onPress,
  onDelete,
}: {
  plan: Plan;
  onPress: () => void;
  onDelete: () => void;
}) {
  const percent = Math.round(plan.progress);
  const milestoneTotal = plan.milestones?.length ?? 0;
  const milestoneDone = plan.milestones?.filter((m) => m.is_completed).length ?? 0;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center mb-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: plan.color + '15' }}
        >
          <Text className="text-xl">{plan.icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
            {plan.title}
          </Text>
          {plan.due_date && (
            <Text className="text-xs text-gray-400">Due: {plan.due_date}</Text>
          )}
        </View>
        <TouchableOpacity
          className="px-2 py-1"
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Text className="text-gray-400 text-sm">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <View
          className="h-full rounded-full transition-all"
          style={{
            width: `${percent}%`,
            backgroundColor: plan.color,
          }}
        />
      </View>

      {/* Milestones */}
      {milestoneTotal > 0 && (
        <View className="flex-row items-center">
          <Text className="text-xs text-gray-400">
            {milestoneDone}/{milestoneTotal} milestones
          </Text>
          <Text className="text-xs font-bold ml-2" style={{ color: plan.color }}>
            {percent}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Screen
// ============================================================================

export default function PlanScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  const currentFilter = FILTER_TABS[activeTab];

  const { data: plans, isLoading, refetch } = useQuery({
    queryKey: ['plans', currentFilter.status],
    queryFn: () => getPlans(currentFilter.status),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        'Delete Plan',
        'Are you sure? This will also delete all milestones and tasks.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteMutation.mutate(id),
          },
        ]
      );
    },
    [deleteMutation]
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">My Plans 🎯</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {plans?.length ?? 0} plans
        </Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-5 mb-4 gap-2">
        {FILTER_TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab.label}
            className={`px-4 py-2 rounded-full ${
              i === activeTab ? 'bg-blue-500' : 'bg-white'
            }`}
            onPress={() => setActiveTab(i)}
          >
            <Text
              className={`text-sm font-medium ${
                i === activeTab ? 'text-white' : 'text-gray-600'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Plans List */}
      <FlatList
        data={plans ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlanCard
            plan={item}
            onPress={() =>
              router.push({ pathname: '/(growth)/plan-detail', params: { id: item.id } })
            }
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-6xl mb-4">🎯</Text>
            <Text className="text-lg text-gray-500">No plans yet</Text>
            <Text className="text-sm text-gray-400 mt-1">
              Tap + to create your first plan!
            </Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/(growth)/plan-edit')}
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
