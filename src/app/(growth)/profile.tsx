/**
 * 个人中心 - 真实数据版
 *
 * V1.0.0.5: 接入 Auth Store + Profile 数据
 */
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { getMonthlyDiaryCount } from "@/db/diaries";
import { getPlans } from "@/db/plans";
import { getStreak } from "@/db/streaks";

// ============================================================================
// Components
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
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();

  const { data: monthlyDiaryCount } = useQuery({
    queryKey: ["diaries", "monthly-count"],
    queryFn: getMonthlyDiaryCount,
  });

  const { data: plans } = useQuery({
    queryKey: ["plans", "active"],
    queryFn: () => getPlans("active"),
  });

  const { data: streak } = useQuery({
    queryKey: ["streak"],
    queryFn: getStreak,
  });

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="bg-white px-5 pt-6 pb-5 mb-4">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
              <Text className="text-2xl">
                {profile?.avatar_url ? "👤" : "🧑"}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {profile?.display_name || user.email?.split("@")[0] || "User"}
              </Text>
              <Text className="text-sm text-gray-500">
                {user.email}
              </Text>
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
            <Text className="text-2xl font-bold text-gray-800">
              {streak?.current_streak ?? 0}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Streak 🔥</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-3 items-center shadow-sm">
            <Text className="text-2xl font-bold text-gray-800">
              {monthlyDiaryCount ?? 0}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Entries</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-3 items-center shadow-sm">
            <Text className="text-2xl font-bold text-gray-800">
              {plans?.length ?? 0}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Plans</Text>
          </View>
        </View>

        {/* Settings */}
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

        <View className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
          <SettingItem icon="❓" title="Help & FAQ" />
          <SettingItem icon="💬" title="Send Feedback" />
          <SettingItem
            icon="ℹ️"
            title="About"
            subtitle="Version 1.0.0.5"
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          className="mx-5 bg-white rounded-2xl py-4 items-center mb-8 shadow-sm"
          onPress={handleSignOut}
        >
          <Text className="text-red-500 font-medium text-base">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
