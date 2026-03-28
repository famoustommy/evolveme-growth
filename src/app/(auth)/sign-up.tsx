/**
 * 注册页面
 *
 * 邮箱+密码注册
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

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      clearError();
      return;
    }
    setLoading(true);
    clearError();
    const result = await signUp(email, password);
    setLoading(false);

    if (result.success) {
      // Check if email confirmation needed
      const { status } = useAuthStore.getState();
      if (status === 'authenticated') {
        router.replace('/(growth)');
      } else {
        // Email confirmation required
        router.replace('/(auth)/confirm-email');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1 px-6"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-center">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
            <Text className="text-base text-gray-500 mt-2">
              Start tracking your growth journey
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
            className="bg-gray-50 rounded-xl px-4 py-3.5 text-base text-gray-900 mb-3"
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          {/* Confirm Password */}
          <TextInput
            className={`bg-gray-50 rounded-xl px-4 py-3.5 text-base text-gray-900 mb-4 ${
              confirmPassword && confirmPassword !== password ? 'border border-red-300' : ''
            }`}
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
            onSubmitEditing={handleSignUp}
          />

          {confirmPassword && confirmPassword !== password && (
            <Text className="text-sm text-red-500 mb-4 -mt-2">
              Passwords don't match
            </Text>
          )}

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`bg-blue-500 rounded-xl py-3.5 items-center mb-6 ${
              loading || !email || !password || password !== confirmPassword
                ? 'opacity-60'
                : ''
            }`}
            onPress={handleSignUp}
            disabled={
              loading || !email || !password || password !== confirmPassword
            }
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text className="text-xs text-gray-400 text-center leading-5">
            By creating an account, you agree to our{'\n'}
            <Text className="text-blue-500">Terms of Service</Text>
            {' '}and{' '}
            <Text className="text-blue-500">Privacy Policy</Text>
          </Text>
        </View>

        {/* Sign In Link */}
        <TouchableOpacity
          className="items-center pb-8 pt-4"
          onPress={() => router.push('/(auth)/sign-in')}
        >
          <Text className="text-blue-500 font-medium text-base">
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
