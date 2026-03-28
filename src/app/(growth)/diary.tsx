/**
 * 成长日记 - 日记列表（真实数据版）
 *
 * V1.0.0.3: 接入 Supabase 数据库
 */
import { useState, useCallback } from 'react';
import { Text, View, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDiaries, deleteDiary } from '@/db/diaries';
import type { Diary } from '@/types/database';
import { MOOD_EMOJI } from '@/types/database';
import { useAuthStore } from '@/store/auth';

// ============================================================================
// Components
// ============================================================================

function DiaryCard({ entry, onDelete }: { entry: Diary; onDelete: (id: string) => void }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      onPress={() => {
        if (status === 'authenticated') {
          router.push({ pathname: '/(growth)/diary-detail', params: { id: entry.id } });
        }
      }}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center mb-2">
        {entry.mood && (
          <Text className="text-2xl mr-3">{MOOD_EMOJI[entry.mood]}</Text>
        )}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
            {entry.title}
          </Text>
          <Text className="text-xs text-gray-400">{entry.diary_date}</Text>
        </View>
        {entry.is_bookmarked && <Text className="text-lg ml-2">⭐</Text>}
      </View>

      <Text className="text-sm text-gray-600 leading-5" numberOfLines={2}>
        {entry.content || 'No content'}
      </Text>

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <View className="flex-row gap-2 mt-3 flex-wrap">
          {entry.tags.map((tag) => (
            <View
              key={tag.id}
              className="bg-blue-50 px-3 py-1 rounded-full"
            >
              <Text className="text-xs text-blue-600">#{tag.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Word count */}
      <View className="flex-row items-center mt-2">
        <Text className="text-xs text-gray-400">{entry.word_count} words</Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// Screen
// ============================================================================

export default function DiaryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['diaries', page],
    queryFn: () => getDiaries({ page, pageSize: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDiary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaries'] });
    },
  });

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const onLoadMore = useCallback(() => {
    if (data && data.data.length < data.count) {
      setPage((p) => p + 1);
    }
  }, [data]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">My Journal 📓</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {data?.count ?? 0} entries
        </Text>
      </View>

      {/* Diary List */}
      <FlatList
        data={data?.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DiaryCard entry={item} onDelete={handleDelete} />
        )}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-6xl mb-4">📝</Text>
            <Text className="text-lg text-gray-500">No diary entries yet</Text>
            <Text className="text-sm text-gray-400 mt-1">
              Tap + to write your first entry!
            </Text>
          </View>
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator className="py-4" color="#3B82F6" />
          ) : null
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/(growth)/diary-edit')}
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
