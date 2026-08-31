import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

// Expo Go can't load custom native modules (AdMob, RevenueCat, etc.) - always
// short-circuit there instead of letting the native lookup crash the app.
export const isExpoGo = (): boolean =>
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type AdsConfig = {
  androidAppId: string;
  iosAppId: string;
  androidBannerId: string;
  iosBannerId: string;
  androidInterstitialId: string;
  iosInterstitialId: string;
  androidRewardedId: string;
  iosRewardedId: string;
};

const DEFAULT_ADS_CONFIG: AdsConfig = {
  androidAppId: '',
  iosAppId: '',
  androidBannerId: '',
  iosBannerId: '',
  androidInterstitialId: '',
  iosInterstitialId: '',
  androidRewardedId: '',
  iosRewardedId: '',
};

export const getAdsConfig = (): AdsConfig => {
  const extra = (Constants.expoConfig?.extra ?? {}) as {
    ads?: Partial<AdsConfig>;
  };

  return {
    androidAppId: extra.ads?.androidAppId ?? DEFAULT_ADS_CONFIG.androidAppId,
    iosAppId: extra.ads?.iosAppId ?? DEFAULT_ADS_CONFIG.iosAppId,
    androidBannerId: extra.ads?.androidBannerId ?? DEFAULT_ADS_CONFIG.androidBannerId,
    iosBannerId: extra.ads?.iosBannerId ?? DEFAULT_ADS_CONFIG.iosBannerId,
    androidInterstitialId: extra.ads?.androidInterstitialId ?? DEFAULT_ADS_CONFIG.androidInterstitialId,
    iosInterstitialId: extra.ads?.iosInterstitialId ?? DEFAULT_ADS_CONFIG.iosInterstitialId,
    androidRewardedId: extra.ads?.androidRewardedId ?? DEFAULT_ADS_CONFIG.androidRewardedId,
    iosRewardedId: extra.ads?.iosRewardedId ?? DEFAULT_ADS_CONFIG.iosRewardedId,
  };
};

export const isAdsConfigured = (): boolean => {
  const ads = getAdsConfig();

  if (Platform.OS === 'android') {
    return Boolean(ads.androidAppId && ads.androidBannerId && ads.androidInterstitialId);
  }

  if (Platform.OS === 'ios') {
    return Boolean(ads.iosAppId && ads.iosBannerId && ads.iosInterstitialId);
  }

  return false;
};

export const getBannerAdUnitId = (): string => {
  const ads = getAdsConfig();
  if (Platform.OS === 'android') {
    return ads.androidBannerId;
  }

  if (Platform.OS === 'ios') {
    return ads.iosBannerId;
  }

  return '';
};

export const getInterstitialAdUnitId = (): string => {
  const ads = getAdsConfig();

  if (Platform.OS === 'android') {
    return ads.androidInterstitialId;
  }

  if (Platform.OS === 'ios') {
    return ads.iosInterstitialId;
  }

  return '';
};

export const getRewardedAdUnitId = (): string => {
  const ads = getAdsConfig();

  if (Platform.OS === 'android') {
    return ads.androidRewardedId;
  }

  if (Platform.OS === 'ios') {
    return ads.iosRewardedId;
  }

  return '';
};

export const isRewardedConfigured = (): boolean => {
  const adUnitId = getRewardedAdUnitId();
  return Boolean(adUnitId);
};
