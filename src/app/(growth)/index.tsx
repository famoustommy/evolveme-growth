/**
 * 今日概览 - 首页
 *
 * 核心功能：
 * - 今日心情打卡
 * - 待办事项速览
 * - 今日日记入口
 * - 计划进度条
 * - 连续打卡天数
 */
import { ScrollView, Text, View, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TodayScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Good Morning 🌅</Text>
          <Text className="text-base text-gray-500 mt-1">Let's make today count</Text>
        </View>

        {/* Mood Check-in Card */}
        <TouchableOpacity className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-3">
            How are you feeling?
          </Text>
          <View className="flex-row justify-between">
            {["😄", "🙂", "😐", "😔", "😢"].map((emoji, i) => (
              <View
                key={i}
                className="w-12 h-12 items-center justify-center rounded-full bg-gray-50"
              >
                <Text className="text-2xl">{emoji}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-blue-50 rounded-2xl p-4">
            <Text className="text-3xl font-bold text-blue-600">7</Text>
            <Text className="text-sm text-blue-700 mt-1">Day Streak 🔥</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-2xl p-4">
            <Text className="text-3xl font-bold text-green-600">3/5</Text>
            <Text className="text-sm text-green-700 mt-1">Tasks Done</Text>
          </View>
        </View>

        {/* Today's Diary Entry */}
        <TouchableOpacity className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-2">
            📝 Today's Diary
          </Text>
          <Text className="text-sm text-gray-400">
            Tap to write your thoughts...
          </Text>
        </TouchableOpacity>

        {/* Active Plans */}
        <TouchableOpacity className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <Text className="text-base font-semibold text-gray-800 mb-2">
            🎯 Active Plans
          </Text>
          <Text className="text-sm text-gray-400">
            You have 2 active plans
          </Text>
        </TouchableOpacity>

        {/* Recent Achievements */}
        <View className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 mb-8">
          <Text className="text-base font-semibold text-white mb-2">
            🏆 Recent Achievement
          </Text>
          <Text className="text-sm text-purple-100">
            "7-Day Journal Streak" — Keep going!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
