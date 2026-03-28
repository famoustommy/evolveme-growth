import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth";

/**
 * App 入口
 *
 * 根据认证状态重定向：
 * - 已登录 → (growth) 主界面
 * - 未登录 → (auth) 登录页
 */
export default function Index() {
  const status = useAuthStore((s) => s.status);

  if (status === "authenticated") {
    return <Redirect href="/(growth)" />;
  }

  // RootLayout 的 AuthGuard 会处理 unauthenticated 跳转
  return null;
}
