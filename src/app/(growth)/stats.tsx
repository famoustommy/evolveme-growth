/**
 * 统计分析 - 数据可视化与洞察
 *
 * 核心功能：
 * - 心情趋势图（周/月/年）
 * - 日记频率统计
 * - 计划完成率
 * - 连续打卡记录
 * - 成长洞察与建议
 */
import { ScrollView, Text, View, TouchableOpacity, SafeAreaView } from "react-native";

// ============================================================================
// Mock Summary Data
// ============================================================================

const weeklyStats = {
  moodTrend: ["😊", "😄", "🙂", "😐", "😄", "🙂", "😊"],
  diaryCount: 5,
  tasksCompleted: 18,
  tasksTotal: 22,
  streakDays: 7,
  longestStreak: 14,
};

// ============================================================================
// Screen
// ============================================================================

export default function StatsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-5 pt-4 pb-8">
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
                {weeklyStats.streakDays}
              </Text>
              <Text className="text-white/80 text-sm mt-1">days 🔥</Text>
            </View>
            <View className="bg-white/20 rounded-xl px-4 py-2">
              <Text className="text-white text-sm">
                Best: {weeklyStats.longestStreak} days
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
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, i) => (
                <View key={day} className="items-center">
                  <Text className="text-2xl mb-2">
                    {weeklyStats.moodTrend[i]}
                  </Text>
                  <Text className="text-xs text-gray-400">{day}</Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View className="grid grid-cols-2 gap-3 mb-4">
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-3xl font-bold text-blue-600">
              {weeklyStats.diaryCount}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Diaries This Week
            </Text>
          </View>
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-3xl font-bold text-green-600">
              {weeklyStats.tasksCompleted}/{weeklyStats.tasksTotal}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Tasks Done</Text>
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
              style={{
                width: `${Math.round(
                  (weeklyStats.tasksCompleted / weeklyStats.tasksTotal) * 100
                )}%`,
              }}
            />
          </View>
          <Text className="text-sm text-gray-500 mt-2 text-right">
            {Math.round(
              (weeklyStats.tasksCompleted / weeklyStats.tasksTotal) * 100
            )}
            %
          </Text>
        </View>

        {/* AI Insight */}
        <View className="bg-indigo-50 rounded-2xl p-5 mb-4">
          <Text className="text-base font-semibold text-indigo-800 mb-2">
            💡 AI Insight
          </Text>
          <Text className="text-sm text-indigo-700 leading-5">
            You've been most productive on Wednesdays. Your mood tends to
            improve after journaling. Consider setting a reminder to write
            on days you skip.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
