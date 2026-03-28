/**
 * OneSignal 推送通知服务
 *
 * 提供统一的推送通知管理接口：
 * - 初始化 SDK
 * - 请求通知权限
 * - 管理用户标签
 * - 处理通知打开事件
 */
import { LogLevel, OneSignal } from 'react-native-onesignal';
import Constants from 'expo-constants';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ONESIGNAL_APP_ID =
  Constants.expoConfig?.extra?.onesignalAppId ||
  process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID ||
  '';

// ============================================================================
// INITIALIZATION
// ============================================================================

let isInitialized = false;

/**
 * 初始化 OneSignal SDK
 * 应在 App 启动时调用（推荐在 _layout.tsx）
 */
export const initOneSignal = async (): Promise<void> => {
  if (isInitialized) return;

  if (!ONESIGNAL_APP_ID) {
    console.warn(
      '⚠️ OneSignal: Missing App ID. Set EXPO_PUBLIC_ONESIGNAL_APP_ID in .env'
    );
    return;
  }

  try {
    // 1. 设置日志级别
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    // 2. 初始化 SDK
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // 3. 请求通知权限
    OneSignal.Notifications.requestPermission(true).then((granted) => {
      if (__DEV__) {
        console.log('🔔 OneSignal: Notification permission granted:', granted);
      }
    });

    // 4. 添加通知点击监听
    OneSignal.Notifications.addEventListener('click', (event) => {
      if (__DEV__) {
        console.log('🔔 OneSignal: Notification clicked:', event);
      }
      // TODO: 根据 notification.additionalData 路由到对应页面
    });

    // 5. 添加前台通知监听
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      if (__DEV__) {
        console.log('🔔 OneSignal: Foreground notification received');
      }
      // 让系统自动显示前台通知
      event.complete();
    });

    isInitialized = true;

    if (__DEV__) {
      console.log('🔔 OneSignal: SDK initialized successfully');
    }
  } catch (error) {
    console.error('❌ OneSignal: Failed to initialize:', error);
  }
};

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * 设置外部用户ID（登录后调用，关联 OneSignal 用户）
 */
export const setUserId = async (userId: string): Promise<void> => {
  try {
    OneSignal.login(userId);
    if (__DEV__) {
      console.log('🔔 OneSignal: User identified:', userId);
    }
  } catch (error) {
    console.error('OneSignal: Failed to set user ID:', error);
  }
};

/**
 * 登出 OneSignal 用户（登出时调用）
 */
export const logout = async (): Promise<void> => {
  try {
    OneSignal.logout();
    if (__DEV__) {
      console.log('🔔 OneSignal: User logged out');
    }
  } catch (error) {
    console.error('OneSignal: Failed to logout:', error);
  }
};

// ============================================================================
// PERMISSIONS
// ============================================================================

/**
 * 检查通知权限状态
 */
export const getPermissionStatus = async (): Promise<boolean> => {
  try {
    const permission = await OneSignal.Notifications.getPermissionAsync();
    return permission;
  } catch (error) {
    console.error('OneSignal: Failed to get permission status:', error);
    return false;
  }
};

/**
 * 请求通知权限
 */
export const requestPermission = async (): Promise<boolean> => {
  try {
    const granted = await OneSignal.Notifications.requestPermission(true);
    if (__DEV__) {
      console.log('🔔 OneSignal: Permission request result:', granted);
    }
    return granted;
  } catch (error) {
    console.error('OneSignal: Failed to request permission:', error);
    return false;
  }
};

// ============================================================================
// TAGS & SEGMENTS
// ============================================================================

/**
 * 设置用户标签（用于精准推送）
 * @param key 标签名（如 "plan"）
 * @param value 标签值（如 "premium"）
 */
export const sendTag = async (key: string, value: string): Promise<void> => {
  try {
    OneSignal.User.addTag(key, value);
    if (__DEV__) {
      console.log('🔔 OneSignal: Tag set:', key, '=', value);
    }
  } catch (error) {
    console.error('OneSignal: Failed to send tag:', error);
  }
};

/**
 * 批量设置用户标签
 */
export const sendTags = async (tags: Record<string, string>): Promise<void> => {
  try {
    OneSignal.User.addTags(tags);
    if (__DEV__) {
      console.log('🔔 OneSignal: Tags set:', Object.keys(tags));
    }
  } catch (error) {
    console.error('OneSignal: Failed to send tags:', error);
  }
};

/**
 * 删除用户标签
 */
export const deleteTag = async (key: string): Promise<void> => {
  try {
    OneSignal.User.deleteTag(key);
    if (__DEV__) {
      console.log('🔔 OneSignal: Tag deleted:', key);
    }
  } catch (error) {
    console.error('OneSignal: Failed to delete tag:', error);
  }
};

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

/**
 * 获取推送通知订阅ID
 */
export const getSubscriptionId = async (): Promise<string | null> => {
  try {
    const id = await OneSignal.User.pushSubscription.getIdAsync();
    return id;
  } catch (error) {
    console.error('OneSignal: Failed to get subscription ID:', error);
    return null;
  }
};

/**
 * 停用推送通知
 */
export const optOut = async (): Promise<void> => {
  try {
    OneSignal.User.pushSubscription.optOut();
    if (__DEV__) {
      console.log('🔔 OneSignal: User opted out');
    }
  } catch (error) {
    console.error('OneSignal: Failed to opt out:', error);
  }
};

/**
 * 启用推送通知
 */
export const optIn = async (): Promise<void> => {
  try {
    OneSignal.User.pushSubscription.optIn();
    if (__DEV__) {
      console.log('🔔 OneSignal: User opted in');
    }
  } catch (error) {
    console.error('OneSignal: Failed to opt in:', error);
  }
};

export default {
  initOneSignal,
  setUserId,
  logout,
  getPermissionStatus,
  requestPermission,
  sendTag,
  sendTags,
  deleteTag,
  getSubscriptionId,
  optOut,
  optIn,
};
