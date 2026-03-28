import "@/global.css";
import "@/locales/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { initSupabase } from "@/services/supabase";
import { initRevenueCat } from "@/services/revenuecat";
import { initOneSignal } from "@/services/onesignal";

// ============================================================================
// Query Client
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// ============================================================================
// Services Initialization
// ============================================================================

/**
 * 并行初始化所有第三方 SDK
 * 非阻塞：即使某个 SDK 初始化失败也不影响 App 启动
 */
const initServices = async () => {
  await Promise.allSettled([
    initSupabase(),
    initRevenueCat(),
    initOneSignal(),
  ]);
};

// ============================================================================
// Root Layout
// ============================================================================

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initServices().then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-sm text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(growth)"
          options={{ headerShown: false }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
