import { Platform } from 'react-native';
import {
  getInterstitialAdUnitId,
  getRewardedAdUnitId,
  isAdsConfigured,
  isExpoGo,
  isRewardedConfigured,
} from '@/utils/AdsConfig';

let sdkInitialized = false;

let interstitialAd: any = null;
let rewardedAd: any = null;

let interstitialLoaded = false;
let interstitialLoading = false;

let rewardedLoaded = false;
let rewardedLoading = false;

let interstitialUnsubscribe: (() => void) | null = null;
let rewardedUnsubscribe: (() => void) | null = null;

const getMobileAdsModule = () => {
  if (Platform.OS === 'web' || isExpoGo()) {
    return null;
  }

  try {
    return require('react-native-google-mobile-ads');
  } catch {
    return null;
  }
};

export const initializeAdsSdk = async (): Promise<void> => {
  const mobileAdsModule = getMobileAdsModule();

  if (!mobileAdsModule || sdkInitialized) {
    return;
  }

  try {
    const mobileAds = mobileAdsModule.default;
    await mobileAds().initialize();
    sdkInitialized = true;
  } catch (error) {
    console.warn('[Ads] SDK failed to initialize:', error);
  }
};

export const preloadInterstitialAd = (): void => {
  const mobileAdsModule = getMobileAdsModule();
  const adUnitId = getInterstitialAdUnitId();

  if (!mobileAdsModule || !isAdsConfigured() || !adUnitId || interstitialLoading || interstitialLoaded) {
    return;
  }

  const { InterstitialAd, AdEventType } = mobileAdsModule;

  interstitialLoading = true;
  interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  if (interstitialUnsubscribe) {
    interstitialUnsubscribe();
  }

  const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded = true;
    interstitialLoading = false;
  });

  const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error: unknown) => {
    console.warn('[Ads] Interstitial failed to load:', error);
    interstitialLoaded = false;
    interstitialLoading = false;
  });

  const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    interstitialLoaded = false;
    interstitialLoading = false;
    preloadInterstitialAd();
  });

  interstitialUnsubscribe = () => {
    unsubscribeLoaded();
    unsubscribeError();
    unsubscribeClosed();
  };

  interstitialAd.load();
};

export const showInterstitialAdIfLoaded = async (): Promise<boolean> => {
  if (!interstitialAd || !interstitialLoaded) {
    preloadInterstitialAd();
    return false;
  }

  try {
    interstitialLoaded = false;
    await interstitialAd.show();
    return true;
  } catch {
    interstitialLoaded = false;
    preloadInterstitialAd();
    return false;
  }
};

export const preloadRewardedAd = (): void => {
  const mobileAdsModule = getMobileAdsModule();
  const adUnitId = getRewardedAdUnitId();

  if (!mobileAdsModule || !isRewardedConfigured() || !adUnitId || rewardedLoading || rewardedLoaded) {
    return;
  }

  const { RewardedAd, AdEventType } = mobileAdsModule;

  rewardedLoading = true;
  rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  if (rewardedUnsubscribe) {
    rewardedUnsubscribe();
  }

  const unsubscribeLoaded = rewardedAd.addAdEventListener(AdEventType.LOADED, () => {
    rewardedLoaded = true;
    rewardedLoading = false;
  });

  const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error: unknown) => {
    console.warn('[Ads] Rewarded ad failed to load:', error);
    rewardedLoaded = false;
    rewardedLoading = false;
  });

  const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    rewardedLoaded = false;
    rewardedLoading = false;
    preloadRewardedAd();
  });

  rewardedUnsubscribe = () => {
    unsubscribeLoaded();
    unsubscribeError();
    unsubscribeClosed();
  };

  rewardedAd.load();
};

export const isRewardedAdReady = (): boolean => {
  return rewardedLoaded;
};

export const showRewardedAdForReward = async (): Promise<boolean> => {
  const mobileAdsModule = getMobileAdsModule();

  if (!mobileAdsModule || !rewardedAd || !rewardedLoaded) {
    preloadRewardedAd();
    return false;
  }

  const { AdEventType, RewardedAdEventType } = mobileAdsModule;

  return new Promise<boolean>((resolve) => {
    let rewardEarned = false;
    let settled = false;

    const finish = (value: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
      resolve(value);
    };

    const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      rewardEarned = true;
    });

    const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      finish(rewardEarned);
      rewardedLoaded = false;
      rewardedLoading = false;
      preloadRewardedAd();
    });

    const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, () => {
      finish(false);
      rewardedLoaded = false;
      rewardedLoading = false;
      preloadRewardedAd();
    });

    rewardedLoaded = false;

    rewardedAd.show().catch((error: unknown) => {
      console.warn('[Ads] Rewarded ad failed to show:', error);
      finish(false);
      rewardedLoaded = false;
      rewardedLoading = false;
      preloadRewardedAd();
    });
  });
};
