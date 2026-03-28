/**
 * 日记详情页面
 *
 * V1.0.0.3: 查看日记详情、编辑、删除
 */
import { View, Text, TouchableOpacity, ScrollView, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDiaryById, deleteDiary } from '@/db/diaries';
import { MOOD_EMOJI } from '@/types/database';

export default function DiaryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: diary, isLoading } = useQuery({
    queryKey: ['diary', params.id],
    queryFn: () => getDiaryById(params.id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDiary(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaries'] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this diary entry? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!diary) return;
    try {
      await Share.share({
        title: diary.title,
        message: `${diary.title}\n\n${diary.content}`,
      });
    } catch {
      // User cancelled
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!diary) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-6xl mb-4">😔</Text>
        <Text className="text-lg text-gray-500">Entry not found</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-6 py-3 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 font-medium text-base">← Back</Text>
        </TouchableOpacity>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={handleShare}>
            <Text className="text-blue-500 text-base">Share</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text className="text-red-500 text-base">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-8">
        {/* Mood + Date */}
        <View className="flex-row items-center mb-4">
          {diary.mood && <Text className="text-3xl mr-3">{MOOD_EMOJI[diary.mood]}</Text>}
          <View>
            <Text className="text-xs text-gray-400">{diary.diary_date}</Text>
            <Text className="text-xs text-gray-400">{diary.word_count} words</Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-4">{diary.title}</Text>

        {/* Content */}
        <Text className="text-base text-gray-700 leading-7">{diary.content}</Text>

        {/* Tags */}
        {diary.tags && diary.tags.length > 0 && (
          <View className="flex-row gap-2 mt-6 flex-wrap">
            {diary.tags.map((tag) => (
              <View
                key={tag.id}
                className="bg-blue-50 px-3 py-1 rounded-full"
              >
                <Text className="text-xs text-blue-600">#{tag.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Edit Button */}
        <TouchableOpacity
          className="mt-8 bg-gray-100 rounded-xl py-3 items-center"
          onPress={() =>
            router.push({ pathname: '/(growth)/diary-edit', params: { id: diary.id } })
          }
        >
          <Text className="text-gray-700 font-medium text-base">Edit Entry</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
