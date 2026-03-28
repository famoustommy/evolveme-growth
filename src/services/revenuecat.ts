/**
 * RevenueCat 订阅管理服务
 * 
 * 提供统一的订阅/内购管理接口：
 * - 初始化 SDK
 * - 获取产品配置
 * - 处理购买流程
 * - 管理订阅状态
 * - 恢复购买
 */
import Purchases from 'react-native-purchases';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ============================================================================
// CONFIGURATION
// ============================================================================

const IOS_API_KEY =
  Constants.expoConfig?.extra?.revenuecatIosApiKey ||
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ||
  '';

const ANDROID_API_KEY =
  Constants.expoConfig?.extra?.revenuecatAndroidApiKey ||
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ||
  '';

// ============================================================================
// TYPES
// ============================================================================

export type SubscriptionStatus = 
  | 'active'      // 订阅有效
  | 'trialing'    // 试用期
  | 'grace_period' // 宽限期
  | 'billing_retry' // 计费重试
  | 'paused'      // 已暂停
  | 'expired'     // 已过期
  | 'unknown';    // 未知

export interface CustomerInfo {
  entitlements: Record<string, {
    productIdentifier: string;
    purchaseDate: number;
    expirationDate: number | null;
  }>;
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  nonSubscriptionTransactions: Array<{
    productId: string;
    purchaseDate: number;
  }>;
}

export interface Offering {
  identifier: string;
  description: string;
  packages: Package[];
}

export interface Package {
  identifier: string;
  product: {
    identifier: string;
    priceString: string;
    price: number;
    currencyCode: string;
    title: string;
    description: string;
    introPrice: {
      priceString: string;
      price: number;
      currencyCode: string;
      periodNumberOfUnits: number;
      periodUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    } | null;
  };
  presentedOfferingContext: unknown;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let isInitialized = false;

/**
 * 初始化 RevenueCat SDK
 * 应在 App 启动时调用（推荐在 _layout.tsx）
 */
export const initRevenueCat = async (): Promise<void> => {
  if (isInitialized) return;

  const apiKey = Platform.select({
    ios: IOS_API_KEY,
    android: ANDROID_API_KEY,
    default: '',
  });

  if (!apiKey) {
    console.warn(
      '⚠️ RevenueCat: Missing API key. Set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY / ANDROID_API_KEY in .env'
    );
    return;
  }

  try {
    Purchases.configure({ apiKey });
    isInitialized = true;

    if (__DEV__) {
      console.log('💰 RevenueCat: SDK initialized successfully');
    }

    // 设置用户属性
    await setupUserAttributes();
  } catch (error) {
    console.error('❌ RevenueCat: Failed to initialize:', error);
  }
};

/**
 * 设置用户属性（语言、时区等）
 */
const setupUserAttributes = async () => {
  try {
    const locale = Constants.expoConfig?.extra?.deviceLocale || 'en';
    await Purchases.setAttributes({
      $appLanguage: locale,
    });
  } catch (error) {
    console.error('RevenueCat: Failed to set attributes:', error);
  }
};

// ============================================================================
// USER IDENTIFICATION
// ============================================================================

/**
 * 设置用户标识符（登录后调用）
 */
export const setUserId = async (userId: string) => {
  try {
    await Purchases.logIn(userId);
    if (__DEV__) {
      console.log('💰 RevenueCat: User identified:', userId);
    }
  } catch (error) {
    console.error('RevenueCat: Failed to set user ID:', error);
  }
};

/**
 * 清除用户标识符（登出时调用）
 */
export const clearUserId = async () => {
  try {
    await Purchases.logOut();
    if (__DEV__) {
      console.log('💰 RevenueCat: User logged out');
    }
  } catch (error) {
    console.error('RevenueCat: Failed to clear user ID:', error);
  }
};

// ============================================================================
// OFFERINGS & PRODUCTS
// ============================================================================

/**
 * 获取当前可用的产品配置
 */
export const getOfferings = async (): Promise<Offering[]> => {
  try {
    const offerings = await Purchases.getOfferings();
    const allOfferings = Object.values(offerings.all) as Offering[];
    
    if (__DEV__) {
      console.log('💰 RevenueCat: Available offerings:', allOfferings.map(o => o.identifier));
    }

    return allOfferings.filter(o => o && o.packages && o.packages.length > 0);
  } catch (error) {
    console.error('RevenueCat: Failed to get offerings:', error);
    return [];
  }
};

// ============================================================================
// PURCHASES
// ============================================================================

/**
 * 购买产品
 * @param aPackage RevenueCat Package 对象
 */
export const purchasePackage = async (aPackage: Package) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(aPackage);
    
    if (__DEV__) {
      console.log('💰 RevenueCat: Purchase successful, entitlements:', 
        Object.keys(customerInfo.entitlements));
    }

    return { customerInfo: customerInfo as unknown as CustomerInfo, error: null };
  } catch (error: unknown) {
    const err = error as { userCancelled?: boolean; code?: string; message?: string };
    
    // 用户取消购买
    if (err?.userCancelled) {
      if (__DEV__) console.log('💰 RevenueCat: Purchase cancelled by user');
      return { customerInfo: null, error: { code: 'CANCELLED', message: 'User cancelled' } };
    }

    console.error('RevenueCat: Purchase failed:', err);
    return { 
      customerInfo: null, 
      error: { 
        code: err?.code || 'PURCHASE_ERROR', 
        message: err?.message || 'Purchase failed' 
      } 
    };
  }
};

/**
 * 恢复之前的购买（App Store/Google Play 必须提供此功能）
 */
export const restorePurchases = async () => {
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    
    if (__DEV__) {
      console.log('💰 RevenueCat: Purchases restored:', 
        customerInfo.activeSubscriptions);
    }

    return { customerInfo: customerInfo as unknown as CustomerInfo, error: null };
  } catch (error) {
    console.error('RevenueCat: Failed to restore purchases:', error);
    return { 
      customerInfo: null, 
      error: { code: 'RESTORE_ERROR', message: 'Failed to restore purchases' } 
    };
  }
};

// ============================================================================
// SUBSCRIPTION STATUS
// ============================================================================

/**
 * 获取当前客户信息
 */
export const getCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo as unknown as CustomerInfo;
  } catch (error) {
    console.error('RevenueCat: Failed to get customer info:', error);
    return null;
  }
};

/**
 * 检查用户是否有活跃订阅
 */
export const hasActiveSubscription = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return Object.keys(customerInfo.entitlements.active).length > 0;
  } catch (error) {
    console.error('RevenueCat: Failed to check subscription:', error);
    return false;
  }
};

/**
 * 获取订阅状态
 */
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const entitlements = Object.values(customerInfo.entitlements.active);

    if (entitlements.length === 0) {
      return 'expired';
    }

    const entitlement = entitlements[0];
    if (!entitlement.expirationDate) {
      return 'active'; // Lifetime purchase
    }

    const now = Date.now() / 1000;
    const expirationDate = entitlement.expirationDate;

    if (expirationDate > now) {
      return 'active';
    }

    return 'expired';
  } catch (error) {
    console.error('RevenueCat: Failed to get subscription status:', error);
    return 'unknown';
  }
};

export default {
  initRevenueCat,
  setUserId,
  clearUserId,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getCustomerInfo,
  hasActiveSubscription,
  getSubscriptionStatus,
};
