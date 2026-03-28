/**
 * 成长日记 - 日记列表与编辑
 *
 * 核心功能：
 * - 日记时间线（按日期分组）
 * - 写日记（富文本 + 心情 + 标签）
 * - 日记模板引导
 * - 照片附件
 * - 日记搜索与筛选
 */
import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================================================
// Mock Data
// ============================================================================

const mockEntries = [
  {
    id: "1",
    date: "2026-03-27",
    mood: "😄",
    title: "Productive Day!",
    excerpt: "Finished the app base setup and started working on the diary feature...",
    tags: ["work", "progress"],
  },
  {
    id: "2",
    date: "2026-03-26",
    mood: "🙂",
    title: "Calm Morning",
    excerpt: "Woke up early, went for a walk. The weather was beautiful...",
    tags: ["health", "mindfulness"],
  },
  {
    id: "3",
    date: "2026-03-25",
    mood: "😐",
    title: "Busy but OK",
    excerpt: "Lots of meetings today. Need to find a better balance...",
    tags: ["work", "reflection"],
  },
];

// ============================================================================
// Components
// ============================================================================

function DiaryCard({ entry }: { entry: typeof mockEntries[0] }) {
  return (
    <TouchableOpacity className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center mb-2">
        <Text className="text-2xl mr-3">{entry.mood}</Text>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">
            {entry.title}
          </Text>
          <Text className="text-xs text-gray-400">{entry.date}</Text>
        </View>
      </View>
      <Text className="text-sm text-gray-600 leading-5" numberOfLines={2}>
        {entry.excerpt}
      </Text>
      <View className="flex-row gap-2 mt-3">
        {entry.tags.map((tag) => (
          <View
            key={tag}
            className="bg-blue-50 px-3 py-1 rounded-full"
          >
            <Text className="text-xs text-blue-600">#{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// Screen
// ============================================================================

export default function DiaryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">My Journal 📓</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {mockEntries.length} entries this month
        </Text>
      </View>

      {/* Diary Entries List */}
      <FlatList
        data={mockEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DiaryCard entry={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-6xl mb-4">📝</Text>
            <Text className="text-lg text-gray-500">No diary entries yet</Text>
            <Text className="text-sm text-gray-400 mt-1">
              Start writing your first entry!
            </Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg">
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
