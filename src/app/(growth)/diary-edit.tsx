/**
 * 日记编辑/创建页面
 *
 * V1.0.0.3: 支持新建和编辑日记
 */
import { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createDiary, updateDiary, getDiaryById } from '@/db/diaries';
import type { MoodLevel } from '@/types/database';
import { MOOD_EMOJI, MOOD_LABEL } from '@/types/database';

const MOOD_OPTIONS: MoodLevel[] = [5, 4, 3, 2, 1];

export default function DiaryEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const isEditing = !!params.id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [loading, setLoading] = useState(false);

  // Load existing diary if editing
  useQuery({
    queryKey: ['diary', params.id],
    queryFn: () => getDiaryById(params.id!),
    enabled: isEditing,
    onSuccess: (data) => {
      if (data) {
        setTitle(data.title);
        setContent(data.content);
        setMood(data.mood);
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEditing && params.id) {
        return updateDiary(params.id, { title, content, mood: mood ?? undefined });
      }
      return createDiary({
        title,
        content,
        mood: mood ?? undefined,
        diary_date: params.date || new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save diary. Please try again.');
      setLoading(false);
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your diary.');
      return;
    }
    setLoading(true);
    saveMutation.mutate();
  };

  useLayoutEffect(() => {
    // Set header buttons via navigation options
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-500 font-medium text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-base font-semibold text-gray-900">
            {isEditing ? 'Edit' : 'New Entry'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Text className="text-blue-500 font-semibold text-base">Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5 pt-4" keyboardShouldPersistTaps="handled">
          {/* Mood Selector */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-500 mb-3">How are you feeling?</Text>
            <View className="flex-row justify-between">
              {MOOD_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m}
                  className={`items-center px-2 py-2 rounded-xl ${
                    mood === m ? 'bg-blue-50' : ''
                  }`}
                  onPress={() => setMood(m)}
                >
                  <Text className="text-3xl mb-1">{MOOD_EMOJI[m]}</Text>
                  <Text
                    className={`text-xs ${
                      mood === m ? 'text-blue-600 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {MOOD_LABEL[m]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title */}
          <TextInput
            className="text-2xl font-bold text-gray-900 mb-4"
            placeholder="Title"
            placeholderTextColor="#D1D5DB"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Content */}
          <TextInput
            className="text-base text-gray-800 leading-7 min-h-[300px] text-align-vertical-top"
            placeholder="Write your thoughts..."
            placeholderTextColor="#D1D5DB"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {/* Word Count */}
          <View className="flex-row justify-end mb-8">
            <Text className="text-xs text-gray-400">{content.length} characters</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
