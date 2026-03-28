/**
 * 邮箱确认页面
 *
 * 注册后提示用户查看邮箱确认
 */
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ConfirmEmailScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center items-center">
        {/* Icon */}
        <Text className="text-7xl mb-6">📧</Text>

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
          Check Your Email
        </Text>

        {/* Description */}
        <Text className="text-base text-gray-500 text-center leading-6 mb-10 px-4">
          We've sent a confirmation link to your email address. Please click it to verify your account.
        </Text>

        {/* Back to Sign In */}
        <TouchableOpacity
          className="bg-blue-500 rounded-xl py-3.5 px-8"
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text className="text-white font-semibold text-base">
            Back to Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
