import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isExpoGo } from '@/utils/AdsConfig';

// Lazily required so an Expo Go session (no native module available) never
// crashes on import - only real dev/preview/production builds touch this.
const getPurchasesModule = (): typeof import('react-native-purchases') | null => {
  if (Platform.OS === 'web' || isExpoGo()) {
    return null;
  }

  try {
    return require('react-native-purchases');
  } catch {
    return null;
  }
};

type EntitlementKey = 'minigames' | 'questions' | 'removeAds';

type RevenueCatConfig = {
  iosApiKey: string;
  androidApiKey: string;
  entitlements: Record<EntitlementKey, string>;
  products: Record<EntitlementKey, string>;
};

export type EntitlementSnapshot = Record<EntitlementKey, boolean>;

export type PurchaseResult = {
  success: boolean;
  cancelled?: boolean;
  message?: string;
  entitlements: EntitlementSnapshot;
};

const DEFAULT_CONFIG: RevenueCatConfig = {
  iosApiKey: '',
  androidApiKey: '',
  entitlements: {
    minigames: 'pro_minigames',
    questions: 'pro_questions',
    removeAds: 'remove_ads',
  },
  products: {
    minigames: 'lesgo_pro_minigames',
    questions: 'lesgo_pro_questions',
    removeAds: 'lesgo_remove_ads',
  },
};

const EMPTY_ENTITLEMENTS: EntitlementSnapshot = {
  minigames: false,
  questions: false,
  removeAds: false,
};

let isConfigured = false;
let purchasesInstance: typeof import('react-native-purchases').default | null = null;

const readConfig = (): RevenueCatConfig => {
  const extra = (Constants.expoConfig?.extra ?? {}) as {
    revenuecat?: Partial<RevenueCatConfig>;
  };

  const fromConfig = extra.revenuecat;

  return {
    iosApiKey: fromConfig?.iosApiKey ?? DEFAULT_CONFIG.iosApiKey,
    androidApiKey: fromConfig?.androidApiKey ?? DEFAULT_CONFIG.androidApiKey,
    entitlements: {
      minigames: fromConfig?.entitlements?.minigames ?? DEFAULT_CONFIG.entitlements.minigames,
      questions: fromConfig?.entitlements?.questions ?? DEFAULT_CONFIG.entitlements.questions,
      removeAds: fromConfig?.entitlements?.removeAds ?? DEFAULT_CONFIG.entitlements.removeAds,
    },
    products: {
      minigames: fromConfig?.products?.minigames ?? DEFAULT_CONFIG.products.minigames,
      questions: fromConfig?.products?.questions ?? DEFAULT_CONFIG.products.questions,
      removeAds: fromConfig?.products?.removeAds ?? DEFAULT_CONFIG.products.removeAds,
    },
  };
};

const mapEntitlements = (customerInfo: any): EntitlementSnapshot => {
  const config = readConfig();
  const activeEntitlements = customerInfo?.entitlements?.active ?? {};

  return {
    minigames: Boolean(activeEntitlements[config.entitlements.minigames]),
    questions: Boolean(activeEntitlements[config.entitlements.questions]),
    removeAds: Boolean(activeEntitlements[config.entitlements.removeAds]),
  };
};

export const initializeRevenueCat = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }

  if (isConfigured) {
    return true;
  }

  const purchasesModule = getPurchasesModule();
  if (!purchasesModule) {
    return false;
  }

  const config = readConfig();
  const apiKey = Platform.OS === 'ios' ? config.iosApiKey : config.androidApiKey;

  if (!apiKey) {
    return false;
  }

  purchasesModule.default.setLogLevel(purchasesModule.LOG_LEVEL.INFO);
  purchasesModule.default.configure({ apiKey });
  purchasesInstance = purchasesModule.default;
  isConfigured = true;
  return true;
};

export const getRevenueCatEntitlements = async (): Promise<EntitlementSnapshot> => {
  const ready = await initializeRevenueCat();
  if (!ready || !purchasesInstance) {
    return EMPTY_ENTITLEMENTS;
  }

  const customerInfo = await purchasesInstance.getCustomerInfo();
  return mapEntitlements(customerInfo);
};

export const purchaseEntitlement = async (key: EntitlementKey): Promise<PurchaseResult> => {
  const ready = await initializeRevenueCat();
  if (!ready || !purchasesInstance) {
    return {
      success: false,
      message: 'RevenueCat no esta configurado. Revisa app.json > expo.extra.revenuecat.',
      entitlements: EMPTY_ENTITLEMENTS,
    };
  }

  const config = readConfig();
  const productId = config.products[key];

  try {
    const products = await purchasesInstance.getProducts([productId]);
    const selectedProduct = products[0];

    if (!selectedProduct) {
      return {
        success: false,
        message: `No se encontro el producto ${productId} en la tienda.`,
        entitlements: await getRevenueCatEntitlements(),
      };
    }

    const result = await purchasesInstance.purchaseStoreProduct(selectedProduct);

    return {
      success: true,
      entitlements: mapEntitlements(result.customerInfo),
    };
  } catch (error: any) {
    return {
      success: false,
      cancelled: Boolean(error?.userCancelled),
      message: error?.message ?? 'Error al procesar la compra.',
      entitlements: await getRevenueCatEntitlements(),
    };
  }
};

export const restoreRevenueCatPurchases = async (): Promise<PurchaseResult> => {
  const ready = await initializeRevenueCat();
  if (!ready || !purchasesInstance) {
    return {
      success: false,
      message: 'RevenueCat no esta configurado. Revisa app.json > expo.extra.revenuecat.',
      entitlements: EMPTY_ENTITLEMENTS,
    };
  }

  try {
    const customerInfo = await purchasesInstance.restorePurchases();
    return {
      success: true,
      entitlements: mapEntitlements(customerInfo),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? 'No se pudieron restaurar compras.',
      entitlements: await getRevenueCatEntitlements(),
    };
  }
};
