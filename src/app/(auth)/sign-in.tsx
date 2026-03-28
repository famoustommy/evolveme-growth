/**
 * 登录页面
 *
 * 支持邮箱密码登录、Apple登录、Google登录
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, signInWithApple, signInWithGoogle, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    clearError();
    const result = await signIn(email, password);
    setLoading(false);
    if (result.success) {
      router.replace('/(growth)');
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    clearError();
    const result = await signInWithApple();
    setLoading(false);
    if (result.success) {
      router.replace('/(growth)');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearError();
    const result = await signInWithGoogle();
    setLoading(false);
    if (result.success) {
      router.replace('/(growth)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1 px-6"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-center">
          {/* Logo */}
          <View className="items-center mb-10">
            <Text className="text-6xl mb-4">🌱</Text>
            <Text className="text-3xl font-bold text-gray-900">Evolveme</Text>
            <Text className="text-base text-gray-500 mt-2">
              Track your growth, one day at a time
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 rounded-xl p-4 mb-4">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3.5 text-base text-gray-900 mb-3"
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          {/* Password Input */}
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3.5 text-base text-gray-900 mb-4"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            onSubmitEditing={handleSignIn}
          />

          {/* Sign In Button */}
          <TouchableOpacity
            className={`bg-blue-500 rounded-xl py-3.5 items-center mb-6 ${
              loading ? 'opacity-60' : ''
            }`}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-sm text-gray-400">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* OAuth Buttons */}
          <View className="gap-3">
            {/* Apple */}
            <TouchableOpacity
              className="bg-black rounded-xl py-3.5 items-center flex-row justify-center"
              onPress={handleAppleSignIn}
              disabled={loading}
            >
              <Text className="text-white font-medium text-base">Continue with Apple</Text>
            </TouchableOpacity>

            {/* Google */}
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-xl py-3.5 items-center flex-row justify-center"
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Text className="text-gray-700 font-medium text-base">Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Link */}
        <TouchableOpacity
          className="items-center pb-8 pt-4"
          onPress={() => router.push('/(auth)/sign-up')}
        >
          <Text className="text-blue-500 font-medium text-base">
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
