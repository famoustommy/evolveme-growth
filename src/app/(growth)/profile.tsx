/**
 * 个人中心 - 设置与账户管理
 *
 * 核心功能：
 * - 用户信息展示
 * - 订阅管理（RevenueCat）
 * - 通知设置（OneSignal）
 * - 主题切换（深色/浅色）
 * - 语言切换
 * - 数据导出
 * - 关于与帮助
 */
import { ScrollView, Text, View, TouchableOpacity, SafeAreaView } from "react-native";

// ============================================================================
// Settings Item Component
// ============================================================================

function SettingItem({
  icon,
  title,
  subtitle,
  rightContent,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  rightContent?: string;
}) {
  return (
    <TouchableOpacity className="flex-row items-center bg-white px-5 py-4 border-b border-gray-50">
      <Text className="text-xl mr-3">{icon}</Text>
      <View className="flex-1">
        <Text className="text-base text-gray-800">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightContent && (
        <Text className="text-sm text-gray-400">{rightContent}</Text>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Screen
// ============================================================================

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-white px-5 pt-6 pb-5 mb-4">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
              <Text className="text-2xl">🧑</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-900">
                Captain
              </Text>
              <Text className="text-sm text-gray-500">Free Plan</Text>
            </View>
            <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-full">
              <Text className="text-sm font-medium text-white">
                Upgrade ✨
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Growth Stats */}
        <View className="flex-row gap-3 px-5 mb-4">
          <View className="flex-1 bg-white rounded-2xl p-3 items-center shadow-sm">
            <Text className="text-2xl font-bold text-gray-800">7</Text>
            <Text className="text-xs text-gray-500 mt-1">Streak 🔥</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-3 items-center shadow-sm">
            <Text className="text-2xl font-bold text-gray-800">23</Text>
            <Text className="text-xs text-gray-500 mt-1">Entries</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-3 items-center shadow-sm">
            <Text className="text-2xl font-bold text-gray-800">3</Text>
            <Text className="text-xs text-gray-500 mt-1">Plans</Text>
          </View>
        </View>

        {/* Settings Sections */}
        <View className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
          <SettingItem
            icon="💎"
            title="Subscription"
            subtitle="Manage your plan"
            rightContent="Free"
          />
          <SettingItem
            icon="🔔"
            title="Notifications"
            subtitle="Push & reminders"
            rightContent="On"
          />
          <SettingItem
            icon="🌙"
            title="Appearance"
            subtitle="Theme & display"
            rightContent="Light"
          />
        </View>

        <View className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
          <SettingItem
            icon="🌐"
            title="Language"
            subtitle="App language"
            rightContent="English"
          />
          <SettingItem
            icon="☁️"
            title="Backup & Sync"
            subtitle="Auto backup to cloud"
          />
          <SettingItem
            icon="📤"
            title="Export Data"
            subtitle="Download your journal"
          />
        </View>

        <View className="bg-white rounded-2xl overflow-hidden mb-8 shadow-sm">
          <SettingItem
            icon="❓"
            title="Help & FAQ"
          />
          <SettingItem
            icon="💬"
            title="Send Feedback"
          />
          <SettingItem
            icon="ℹ️"
            title="About"
            subtitle="Version 1.0.0"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
