/**
 * 统计分析 - 真实数据版
 *
 * V1.0.0.5: 接入 Supabase 数据
 */
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { getStreak } from "@/db/streaks";
import { getWeeklyMoodChecks, getMoodStats } from "@/db/mood-checks";
import { getMonthlyDiaryCount } from "@/db/diaries";
import { getWeeklyTaskStats } from "@/db/tasks";
import { MOOD_EMOJI } from "@/types/database";
import type { MoodLevel } from "@/types/database";

// ============================================================================
// Helpers
// ============================================================================

function getWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getMonthStart(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ============================================================================
// Screen
// ============================================================================

export default function StatsScreen() {
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const { data: streak } = useQuery({
    queryKey: ["streak"],
    queryFn: getStreak,
  });

  const { data: weeklyMoods } = useQuery({
    queryKey: ["mood-checks", "weekly"],
    queryFn: () => getWeeklyMoodChecks(weekStart),
  });

  const { data: moodStats } = useQuery({
    queryKey: ["mood-checks", "stats"],
    queryFn: () => getMoodStats(monthStart, new Date().toISOString()),
  });

  const { data: monthlyDiaryCount } = useQuery({
    queryKey: ["diaries", "monthly-count"],
    queryFn: getMonthlyDiaryCount,
  });

  const { data: taskStats } = useQuery({
    queryKey: ["tasks", "weekly-stats"],
    queryFn: getWeeklyTaskStats,
  });

  // Build weekly mood array (7 days)
  const weeklyMoodMap: Record<string, MoodLevel> = {};
  for (const mc of weeklyMoods ?? []) {
    const dateStr = new Date(mc.checked_at).toISOString().split("T")[0];
    weeklyMoodMap[dateStr] = mc.mood;
  }

  const weekDays = DAY_NAMES.map((day, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    return {
      day,
      mood: weeklyMoodMap[dateStr] ?? null,
    };
  });

  const taskRate =
    taskStats && taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  // Top mood
  const topMood = moodStats?.reduce(
    (prev, curr) => (curr.count > prev.count ? curr : prev),
    { mood: 3, count: 0 }
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-5 pt-4 pb-8" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Insights 📊</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Your growth at a glance
          </Text>
        </View>

        {/* Streak Card */}
        <View className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-5 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/80 text-sm">Current Streak</Text>
              <Text className="text-4xl font-bold text-white mt-1">
                {streak?.current_streak ?? 0}
              </Text>
              <Text className="text-white/80 text-sm mt-1">days 🔥</Text>
            </View>
            <View className="bg-white/20 rounded-xl px-4 py-2">
              <Text className="text-white text-sm">
                Best: {streak?.longest_streak ?? 0} days
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Mood Trend */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-4">
            Mood This Week
          </Text>
          <View className="flex-row justify-between">
            {weekDays.map(({ day, mood }) => (
              <View key={day} className="items-center">
                <Text className="text-2xl mb-2">
                  {mood ? MOOD_EMOJI[mood] : "·"}
                </Text>
                <Text className="text-xs text-gray-400">{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-3xl font-bold text-blue-600">
              {monthlyDiaryCount ?? 0}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Diaries This Month
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-3xl font-bold text-green-600">
              {taskStats?.completed ?? 0}/{taskStats?.total ?? 0}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Tasks This Week</Text>
          </View>
        </View>

        {/* Task Completion Rate */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-3">
            Task Completion Rate
          </Text>
          <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${taskRate}%` }}
            />
          </View>
          <Text className="text-sm text-gray-500 mt-2 text-right">
            {taskRate}%
          </Text>
        </View>

        {/* Mood Distribution */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-4">
            Mood Distribution (This Month)
          </Text>
          {(moodStats ?? [])
            .filter((m) => m.count > 0)
            .map((m) => (
              <View key={m.mood} className="flex-row items-center mb-2">
                <Text className="text-lg w-8">{MOOD_EMOJI[m.mood]}</Text>
                <View className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-3">
                  <View
                    className="h-full bg-blue-400 rounded-full"
                    style={{
                      width: `${moodStats ? (m.count / Math.max(...moodStats.map((s) => s.count))) * 100 : 0}%`,
                    }}
                  />
                </View>
                <Text className="text-sm text-gray-500 w-8 text-right">{m.count}</Text>
              </View>
            ))}
        </View>

        {/* AI Insight */}
        {topMood && topMood.count > 0 && (
          <View className="bg-indigo-50 rounded-2xl p-5 mb-4">
            <Text className="text-base font-semibold text-indigo-800 mb-2">
              💡 Insight
            </Text>
            <Text className="text-sm text-indigo-700 leading-5">
              Your most common mood this month is{" "}
              {MOOD_EMOJI[topMood.mood]}.{" "}
              {topMood.mood >= 4
                ? "You're having a great month! Keep it up!"
                : topMood.mood >= 3
                ? "A balanced month so far. Journaling can help boost your mood!"
                : "It's been a challenging month. Remember, tracking your feelings is the first step to improvement."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
