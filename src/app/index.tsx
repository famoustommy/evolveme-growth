import { Redirect } from "expo-router";

/**
 * 首页 - 自动重定向到成长日记系统
 * 
 * 后续可改为：
 * - 登录检测 → 未登录跳登录页
 * - 已登录 → 跳 (growth) tab
 */
export default function Index() {
  return <Redirect href="/(growth)" />;
}
