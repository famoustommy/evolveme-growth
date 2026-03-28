/**
 * 计划创建/编辑页面
 *
 * V1.0.0.4: 支持 CRUD
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
import { createPlan, updatePlan, getPlanById } from '@/db/plans';
import type { RepeatType } from '@/types/database';

const ICONS = ['🚀', '💪', '📚', '🎨', '🎵', '💻', '🏃', '🧘', '📝', '🎯', '❤️', '🌟'];
const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export default function PlanEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!params.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#3B82F6');
  const [dueDate, setDueDate] = useState('');
  const [repeatType, setRepeatType] = useState<RepeatType>('none');
  const [loading, setLoading] = useState(false);

  useQuery({
    queryKey: ['plan', params.id],
    queryFn: () => getPlanById(params.id!),
    enabled: isEditing,
    onSuccess: (data) => {
      if (data) {
        setTitle(data.title);
        setDescription(data.description);
        setIcon(data.icon);
        setColor(data.color);
        setDueDate(data.due_date ?? '');
        setRepeatType(data.repeat_type);
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEditing && params.id) {
        return updatePlan(params.id, {
          title,
          description,
          icon,
          color,
          due_date: dueDate || null,
          repeat_type: repeatType,
        });
      }
      return createPlan({
        title,
        description,
        icon,
        color,
        due_date: dueDate || null,
        repeat_type: repeatType,
      });
    },
    onSuccess: () => {
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save plan.');
      setLoading(false);
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your plan.');
      return;
    }
    setLoading(true);
    saveMutation.mutate();
  };

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
            {isEditing ? 'Edit Plan' : 'New Plan'}
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
          {/* Icon Picker */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-500 mb-3">Choose Icon</Text>
            <View className="flex-row flex-wrap gap-3">
              {ICONS.map((i) => (
                <TouchableOpacity
                  key={i}
                  className={`w-12 h-12 rounded-xl items-center justify-center ${
                    icon === i ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                  }`}
                  onPress={() => setIcon(i)}
                >
                  <Text className="text-xl">{i}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Picker */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-500 mb-3">Choose Color</Text>
            <View className="flex-row gap-3">
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  className={`w-10 h-10 rounded-full ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>
          </View>

          {/* Title */}
          <TextInput
            className="text-xl font-bold text-gray-900 mb-3"
            placeholder="Plan title"
            placeholderTextColor="#D1D5DB"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          {/* Description */}
          <TextInput
            className="text-base text-gray-700 leading-6 mb-6 min-h-[80px]"
            placeholder="Description (optional)"
            placeholderTextColor="#D1D5DB"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          {/* Due Date */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-500 mb-3">Due Date (optional)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-900"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={dueDate}
              onChangeText={setDueDate}
              maxLength={10}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          {/* Repeat Type */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-gray-500 mb-3">Repeat</Text>
            <View className="flex-row gap-2 flex-wrap">
              {(['none', 'daily', 'weekly', 'monthly'] as RepeatType[]).map((rt) => (
                <TouchableOpacity
                  key={rt}
                  className={`px-4 py-2 rounded-full ${
                    repeatType === rt ? 'bg-blue-500' : 'bg-gray-100'
                  }`}
                  onPress={() => setRepeatType(rt)}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${
                      repeatType === rt ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {rt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
