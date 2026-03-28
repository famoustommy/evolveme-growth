/**
 * 今日概览 - 首页（真实数据版）
 *
 * V1.0.0.3: 接入 Supabase 真实数据
 */
import { useCallback, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTodayMoodCheck,
  submitMoodCheck,
  getStreak,
  updateStreakAfterCheckIn,
} from '@/db';
import { getTodayTaskStats } from '@/db/tasks';
import { getMonthlyDiaryCount } from '@/db/diaries';
import type { MoodLevel } from '@/types/database';
import { MOOD_EMOJI } from '@/types/database';

const MOOD_OPTIONS: MoodLevel[] = [5, 4, 3, 2, 1];

export default function TodayScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [moodAnim, setMoodAnim] = useState(false);

  const { data: todayMood } = useQuery({
    queryKey: ['mood-check', 'today'],
    queryFn: getTodayMoodCheck,
  });

  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: getStreak,
  });

  const { data: taskStats } = useQuery({
    queryKey: ['tasks', 'today-stats'],
    queryFn: getTodayTaskStats,
  });

  const { data: monthlyDiaryCount } = useQuery({
    queryKey: ['diaries', 'monthly-count'],
    queryFn: getMonthlyDiaryCount,
  });

  const moodMutation = useMutation({
    mutationFn: (mood: MoodLevel) => submitMoodCheck({ mood }),
    onSuccess: async () => {
      await updateStreakAfterCheckIn();
      queryClient.invalidateQueries({ queryKey: ['mood-check'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    },
  });

  const handleMoodSelect = useCallback(
    (mood: MoodLevel) => {
      if (todayMood) {
        Alert.alert('Already Checked In', 'You\'ve already logged your mood today. See you tomorrow! 🌅');
        return;
      }
      moodMutation.mutate(mood);
      setMoodAnim(true);
      setTimeout(() => setMoodAnim(false), 600);
    },
    [todayMood, moodMutation]
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Good Morning 🌅</Text>
          <Text className="text-base text-gray-500 mt-1">Let's make today count</Text>
        </View>

        {/* Mood Check-in Card */}
        <TouchableOpacity
          className={`bg-white rounded-2xl p-5 mb-4 shadow-sm ${
            todayMood ? 'opacity-80' : ''
          }`}
          activeOpacity={0.9}
        >
          <Text className="text-base font-semibold text-gray-800 mb-3">
            {todayMood ? "Today's Mood ✅" : 'How are you feeling?'}
          </Text>
          <View className="flex-row justify-between">
            {MOOD_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m}
                className={`w-12 h-12 items-center justify-center rounded-full ${
                  todayMood?.mood === m
                    ? 'bg-blue-100 scale-110'
                    : moodAnim
                    ? 'bg-blue-50'
                    : 'bg-gray-50'
                }`}
                onPress={() => handleMoodSelect(m)}
              >
                <Text className="text-2xl">{MOOD_EMOJI[m]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {moodMutation.isPending && (
            <ActivityIndicator className="mt-3 self-center" size="small" color="#3B82F6" />
          )}
        </TouchableOpacity>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-orange-50 rounded-2xl p-4">
            <Text className="text-3xl font-bold text-orange-600">
              {streak?.current_streak ?? 0}
            </Text>
            <Text className="text-sm text-orange-700 mt-1">Day Streak 🔥</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-2xl p-4">
            <Text className="text-3xl font-bold text-green-600">
              {taskStats?.done ?? 0}/{taskStats?.total ?? 0}
            </Text>
            <Text className="text-sm text-green-700 mt-1">Tasks Done</Text>
          </View>
          <View className="flex-1 bg-blue-50 rounded-2xl p-4">
            <Text className="text-3xl font-bold text-blue-600">
              {monthlyDiaryCount ?? 0}
            </Text>
            <Text className="text-sm text-blue-700 mt-1">This Month 📓</Text>
          </View>
        </View>

        {/* Today's Diary Entry */}
        <TouchableOpacity
          className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
          onPress={() => router.push('/(growth)/diary-edit')}
        >
          <Text className="text-base font-semibold text-gray-800 mb-2">
            📝 Today's Diary
          </Text>
          <Text className="text-sm text-gray-400">
            Tap to write your thoughts...
          </Text>
        </TouchableOpacity>

        {/* Quick Actions */}
        <TouchableOpacity
          className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
          onPress={() => router.push('/(growth)/diary')}
        >
          <Text className="text-base font-semibold text-gray-800 mb-2">
            📓 Recent Journals
          </Text>
          <Text className="text-sm text-gray-400">
            View all your diary entries
          </Text>
        </TouchableOpacity>

        {/* Recent Achievement */}
        {(streak?.current_streak ?? 0) >= 7 && (
          <View className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 mb-8">
            <Text className="text-base font-semibold text-white mb-2">
              🏆 Achievement Unlocked!
            </Text>
            <Text className="text-sm text-purple-100">
              "{streak!.current_streak}-Day Streak" — Keep going!
            </Text>
          </View>
        )}

        {/* Best Streak */}
        {(streak?.longest_streak ?? 0) > 0 && (
          <View className="bg-gray-100 rounded-2xl p-5 mb-8">
            <Text className="text-sm text-gray-500">
              🏅 Best streak: {streak!.longest_streak} days
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
