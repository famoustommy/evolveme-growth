/**
 * 成长日记+计划系统 - 根布局
 *
 * Tab 导航结构：
 * - (tabs)/index    → 今日概览（首页）
 * - (tabs)/diary    → 成长日记
 * - (tabs)/plan     → 计划管理
 * - (tabs)/stats    → 统计分析
 * - (tabs)/profile  → 个人中心
 */
import { Tabs } from "expo-router";
import { Text, View } from "react-native";

export default function GrowthLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#1F2937",
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F3F4F6",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => (
            <TabIcon name="home" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: "Diary",
          tabBarIcon: ({ color }) => (
            <TabIcon name="book" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: "Plan",
          tabBarIcon: ({ color }) => (
            <TabIcon name="clipboard" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => (
            <TabIcon name="chart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ color }) => (
            <TabIcon name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// ============================================================================
// Tab Icon Placeholder
// ============================================================================

/**
 * 临时 Tab 图标组件
 * TODO: 替换为 @expo/vector-icons 中的 SF Symbols
 */
function TabIcon({
  name,
  color,
  size = 24,
}: {
  name: string;
  color: string;
  size?: number;
}) {
  // 简单的文字图标占位，后续替换为 Ionicons
  const icons: Record<string, string> = {
    home: "🏠",
    book: "📓",
    clipboard: "📋",
    chart: "📊",
    user: "👤",
  };

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      {/* @ts-expect-error emoji as icon placeholder */}
      <Text style={{ fontSize: size * 0.6, color }}>
        {icons[name] || "⬡"}
      </Text>
    </View>
  );
}


