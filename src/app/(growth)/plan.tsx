/**
 * 计划管理 - 目标与计划追踪
 *
 * 核心功能：
 * - 计划列表（进行中/已完成/已归档）
 * - 创建计划（SMART 原则引导）
 * - 里程碑与子任务
 * - 每日/每周/自定义周期
 * - 计划进度可视化
 */
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";

// ============================================================================
// Mock Data
// ============================================================================

const mockPlans = [
  {
    id: "1",
    title: "Build Growth App",
    icon: "🚀",
    progress: 0.35,
    milestones: 3,
    completedMilestones: 1,
    color: "#3B82F6",
    dueDate: "2026-04-30",
  },
  {
    id: "2",
    title: "Exercise 3x/week",
    icon: "💪",
    progress: 0.6,
    milestones: 12,
    completedMilestones: 7,
    color: "#10B981",
    dueDate: "2026-06-30",
  },
  {
    id: "3",
    title: "Read 12 Books",
    icon: "📚",
    progress: 0.25,
    milestones: 12,
    completedMilestones: 3,
    color: "#8B5CF6",
    dueDate: "2026-12-31",
  },
];

// ============================================================================
// Components
// ============================================================================

function PlanCard({ plan }: { plan: typeof mockPlans[0] }) {
  const percent = Math.round(plan.progress * 100);
  return (
    <TouchableOpacity className="bg-white rounded-2xl p-5 mb-3 shadow-sm">
      <View className="flex-row items-center mb-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: plan.color + "15" }}
        >
          <Text className="text-xl">{plan.icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">
            {plan.title}
          </Text>
          <Text className="text-xs text-gray-400">
            Due: {plan.dueDate}
          </Text>
        </View>
        <Text className="text-sm font-bold" style={{ color: plan.color }}>
          {percent}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: plan.color,
          }}
        />
      </View>

      {/* Milestones */}
      <View className="flex-row items-center mt-3">
        <Text className="text-xs text-gray-400">
          {plan.completedMilestones}/{plan.milestones} milestones
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// Screen
// ============================================================================

export default function PlanScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">My Plans 🎯</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {mockPlans.length} active plans
        </Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-5 mb-4 gap-2">
        {["Active", "Completed", "Archived"].map((tab, i) => (
          <TouchableOpacity
            key={tab}
            className={`px-4 py-2 rounded-full ${
              i === 0
                ? "bg-blue-500"
                : "bg-white"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                i === 0 ? "text-white" : "text-gray-600"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Plans List */}
      <FlatList
        data={mockPlans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlanCard plan={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg">
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
