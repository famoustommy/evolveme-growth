/**
 * 计划详情页面
 *
 * V1.0.0.4: 查看计划、管理里程碑
 */
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPlanById,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  updatePlan,
} from '@/db/plans';

export default function PlanDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [newMilestone, setNewMilestone] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan', params.id],
    queryFn: () => getPlanById(params.id),
  });

  const milestoneMutations = {
    create: useMutation({
      mutationFn: (title: string) => createMilestone(params.id, { title }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['plan', params.id] });
        queryClient.invalidateQueries({ queryKey: ['plans'] });
        setNewMilestone('');
        setIsAdding(false);
      },
    }),
    toggle: useMutation({
      mutationFn: ({ id, is_completed }: { id: string; is_completed: boolean }) =>
        updateMilestone(id, { is_completed }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['plan', params.id] });
        queryClient.invalidateQueries({ queryKey: ['plans'] });
      },
    }),
    delete: useMutation({
      mutationFn: deleteMilestone,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['plan', params.id] });
        queryClient.invalidateQueries({ queryKey: ['plans'] });
      },
    }),
  };

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return;
    milestoneMutations.create.mutate(newMilestone.trim());
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-500">Plan not found</Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-blue-500">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totalMilestones = plan.milestones?.length ?? 0;
  const doneMilestones = plan.milestones?.filter((m) => m.is_completed).length ?? 0;
  const percent = Math.round(plan.progress);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-5 border-b border-gray-100">
        <TouchableOpacity className="mb-3" onPress={() => router.back()}>
          <Text className="text-blue-500 font-medium text-base">← Back</Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-3">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: plan.color + '15' }}
          >
            <Text className="text-2xl">{plan.icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">{plan.title}</Text>
            {plan.due_date && (
              <Text className="text-sm text-gray-400">Due: {plan.due_date}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/(growth)/plan-edit', params: { id: plan.id } })
            }
          >
            <Text className="text-blue-500 font-medium">Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View className="flex-row items-center gap-4">
          <View className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${percent}%`, backgroundColor: plan.color }}
            />
          </View>
          <Text className="text-sm font-bold" style={{ color: plan.color }}>
            {percent}%
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-5 pb-8">
        {/* Description */}
        {plan.description ? (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-sm text-gray-600 leading-5">{plan.description}</Text>
          </View>
        ) : null}

        {/* Milestones Header */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-gray-800">
            Milestones ({doneMilestones}/{totalMilestones})
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-3 py-1.5 rounded-full"
            onPress={() => setIsAdding(!isAdding)}
          >
            <Text className="text-white text-xs font-medium">+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Add Milestone Input */}
        {isAdding && (
          <View className="bg-white rounded-xl p-3 mb-4 shadow-sm flex-row gap-2">
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder="New milestone..."
              placeholderTextColor="#9CA3AF"
              value={newMilestone}
              onChangeText={setNewMilestone}
              autoFocus
              onSubmitEditing={handleAddMilestone}
            />
            <TouchableOpacity
              className="bg-blue-500 px-4 rounded-lg items-center justify-center"
              onPress={handleAddMilestone}
            >
              <Text className="text-white font-medium text-sm">Add</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Milestones List */}
        {(plan.milestones ?? []).map((milestone) => (
          <View
            key={milestone.id}
            className="bg-white rounded-xl p-4 mb-2 shadow-sm flex-row items-center"
          >
            <TouchableOpacity
              className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                milestone.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}
              onPress={() =>
                milestoneMutations.toggle.mutate({
                  id: milestone.id,
                  is_completed: !milestone.is_completed,
                })
              }
            >
              {milestone.is_completed && <Text className="text-white text-xs">✓</Text>}
            </TouchableOpacity>
            <View className="flex-1">
              <Text
                className={`text-base ${
                  milestone.is_completed ? 'text-gray-400 line-through' : 'text-gray-800'
                }`}
              >
                {milestone.title}
              </Text>
              {milestone.due_date && (
                <Text className="text-xs text-gray-400 mt-0.5">{milestone.due_date}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Delete Milestone', 'Remove this milestone?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => milestoneMutations.delete.mutate(milestone.id),
                  },
                ]);
              }}
            >
              <Text className="text-gray-400 text-sm">✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Empty state */}
        {totalMilestones === 0 && (
          <View className="items-center py-8">
            <Text className="text-gray-400 text-sm">
              No milestones yet. Add your first one!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
