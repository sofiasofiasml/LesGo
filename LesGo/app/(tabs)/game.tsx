import { Text, View } from '@/components/Themed';
import GameCard from '@/components/game/GameCard';
import InfoModal from '@/components/game/InfoModal';
import RouletteModal from '@/components/game/RouletteModal';
import TimerModal from '@/components/game/TimerModal';
import VictoryScreen from '@/components/game/VictoryScreen';
import BrickBreaker from '@/components/game/minigames/BrickBreaker';
import FastTapper from '@/components/game/minigames/FastTapper';
import FlappyDrink from '@/components/game/minigames/FlappyDrink';
import FortuneRoulette from '@/components/game/minigames/FortuneRoulette';
import GiftBox from '@/components/game/minigames/GiftBox';
import HighLow from '@/components/game/minigames/HighLow';
import HotPotato from '@/components/game/minigames/HotPotato';
import MemoryChallenge from '@/components/game/minigames/MemoryChallenge';
import PrecisionSniper from '@/components/game/minigames/PrecisionSniper';
import ReflexDuel from '@/components/game/minigames/ReflexDuel';
import StopTheBus from '@/components/game/minigames/StopTheBus';
import WireCut from '@/components/game/minigames/WireCut';
import { Card, GAME_CARDS } from '@/constants/GameData';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, useColorScheme, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FingerRoulette from '@/components/game/minigames/FingerRoulette';
import FingerSoccer from '@/components/game/minigames/FingerSoccer';

import BalanceChallenge from '@/components/game/minigames/BalanceChallenge';
import ColorMatch from '@/components/game/minigames/ColorMatch';
import DrunkPairs from '@/components/game/minigames/DrunkPairs';
import HungryHippos from '@/components/game/minigames/HungryHippos';
import MathSprint from '@/components/game/minigames/MathSprint';
import TugOfWar from '@/components/game/minigames/TugOfWar';
import { getBannerAdUnitId, isAdsConfigured, isExpoGo, isRewardedConfigured } from '@/utils/AdsConfig';
import {
    initializeAdsSdk,
    isRewardedAdReady,
    preloadInterstitialAd,
    preloadRewardedAd,
    showInterstitialAdIfLoaded,
    showRewardedAdForReward
} from '@/utils/AdsManager';
import {
    EntitlementSnapshot,
    getRevenueCatEntitlements,
    initializeRevenueCat,
    purchaseEntitlement,
    restoreRevenueCatPurchases
} from '@/utils/RevenueCat';

// Fisher-Yates Shuffle Algorithm
const shuffleArray = (array: Card[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Helper: Format card text with dynamic names
const formatCardText = (text: string, players: string[], currentPlayer: string) => {
    if (!text.includes('{player}')) return text;

    // Get other players
    const others = players.filter(p => p !== currentPlayer);
    if (others.length === 0) return text.replace('{player}', 'alguien');

    // Pick random player
    const randomPlayer = others[Math.floor(Math.random() * others.length)];
    return text.replace('{player}', randomPlayer);
};

// Helper: Haptics
const playHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    switch (style) {
        case 'light': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
        case 'medium': Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
        case 'heavy': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
    }
};

const FREE_MINIGAME_KEYS = new Set([
    'brick',
    'tapper',
    'memory',
    'stop',
    'highlow',
    'potato',
]);

const PAID_MINIGAME_EFFECTS = new Set([
    'minigame_flappy',
    'minigame_roulette',
    'minigame_reflex',
    'minigame_box',
    'minigame_sniper',
    'minigame_wire',
    'minigame_finger',
    'minigame_soccer',
    'minigame_tug',
    'minigame_balance',
    'minigame_pairs',
    'minigame_hippo',
    'minigame_color',
    'minigame_math',
]);

const DEFAULT_ENTITLEMENTS: EntitlementSnapshot = {
    minigames: false,
    questions: false,
    removeAds: false,
};

const INTERSTITIAL_FREQUENCY = 4;

// Codigo secreto para desactivar anuncios sin pasar por compra (uso propio/admin).
// Cambialo por el que quieras antes de publicar.
const ADMIN_UNLOCK_CODE = 'lesgo-admin-2026';
const ADMIN_UNLOCK_STORAGE_KEY = 'lesgo_admin_unlock_all';

export default function GameScreen() {
    const insets = useSafeAreaInsets();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [drinkMessage, setDrinkMessage] = useState('¡BEBE!'); // Initial default
    const isCompactScreen = screenHeight < 760;
    const turnLabelSize = isCompactScreen ? 13 : 16;
    const turnNameSize = Math.max(28, Math.min(42, screenWidth * (isCompactScreen ? 0.082 : 0.095)));
    const turnNameLineHeight = turnNameSize + (isCompactScreen ? 5 : 8);
    const scoreModalTitleSize = Math.max(20, Math.min(30, screenWidth * 0.066));
    const scorePlayerNameSize = Math.max(14, Math.min(18, screenWidth * 0.044));
    const scorePointsSize = Math.max(14, Math.min(20, screenWidth * 0.05));
    const medalSize = Math.max(16, Math.min(20, screenWidth * 0.048));
    const exitModalTitleSize = Math.max(20, Math.min(30, screenWidth * 0.065));
    const exitModalTextSize = Math.max(14, Math.min(17, screenWidth * 0.043));
    const exitButtonTextSize = Math.max(14, Math.min(18, screenWidth * 0.045));
    const drinkMessageLength = drinkMessage?.length ?? 0;
    const drinkBaseTitleSize = Math.max(26, Math.min(46, screenWidth * 0.1));
    const drinkTitleScale = drinkMessageLength > 40 ? 0.64
        : drinkMessageLength > 30 ? 0.74
            : drinkMessageLength > 22 ? 0.84
                : 1;
    const drinkTitleSize = Math.max(20, Math.round(drinkBaseTitleSize * drinkTitleScale));
    const drinkPlayerSize = Math.max(18, Math.min(24, screenWidth * 0.058));
    const drinkButtonTextSize = Math.max(14, Math.min(18, screenWidth * 0.045));
    const isVerySmallScreen = screenHeight < 700 || screenWidth < 360;
    const drinkIconSize = Math.max(54, Math.min(80, Math.round(Math.min(screenWidth, screenHeight) * 0.14)));
    const drinkModalMaxHeight = Math.min(Math.round(screenHeight * 0.75), 520);

    const physicalScreenHeight = Dimensions.get('screen').height;
    const bottomSystemArea = Math.max(0, physicalScreenHeight - screenHeight);
    const hasAndroidNavButtons = Platform.OS === 'android' && bottomSystemArea >= 24;

    const bottomInteractionPadding = hasAndroidNavButtons
        ? Math.min(42, bottomSystemArea + 10)
        : Math.max(2, insets.bottom > 0 ? insets.bottom - 4 : 2);

    const buttonBottomMargin = hasAndroidNavButtons ? 10 : (isCompactScreen ? 4 : 6);

    const [gameState, setGameState] = useState<'config' | 'setup' | 'playing' | 'victory'>('setup');
    const [players, setPlayers] = useState<string[]>([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    const [deck, setDeck] = useState<Card[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

    // Points system
    const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
    const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward, -1 = backward
    const [doublePoints, setDoublePoints] = useState(false);
    const [skipNext, setSkipNext] = useState(false);
    const [showScoreboard, setShowScoreboard] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    // Player selection modal for steal/gift effects
    const [playerSelectionModal, setPlayerSelectionModal] = useState(false);
    const [selectionAction, setSelectionAction] = useState<'steal' | 'gift' | 'roulette_steal' | null>(null);
    const [winner, setWinner] = useState<string | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [currentRound, setCurrentRound] = useState(1);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [targetScore, setTargetScore] = useState(30);
    const [usedCardIds, setUsedCardIds] = useState<string[]>([]); // Track used card IDs

    // Timer State
    const [timerVisible, setTimerVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [timerActive, setTimerActive] = useState(false);

    // Roulette State
    const [showRoulette, setShowRoulette] = useState(false);
    const [isRouletteMode, setIsRouletteMode] = useState(false);
    const [pendingRouletteAction, setPendingRouletteAction] = useState<'turn' | 'effect'>('turn');
    const [showBrickBreaker, setShowBrickBreaker] = useState(false);
    const [showFlappyDrink, setShowFlappyDrink] = useState(false);
    const [showFortuneRoulette, setShowFortuneRoulette] = useState(false);
    const [showFastTapper, setShowFastTapper] = useState(false);
    const [showMemoryChallenge, setShowMemoryChallenge] = useState(false);
    const [showReflexDuel, setShowReflexDuel] = useState(false);
    const [showStopTheBus, setShowStopTheBus] = useState(false);
    const [showHighLow, setShowHighLow] = useState(false);
    const [showHotPotato, setShowHotPotato] = useState(false);
    const [showPrecisionSniper, setShowPrecisionSniper] = useState(false);
    const [showWireCut, setShowWireCut] = useState(false);

    const [showFingerRoulette, setShowFingerRoulette] = useState(false);
    const [showFingerSoccer, setShowFingerSoccer] = useState(false);

    const [showTugOfWar, setShowTugOfWar] = useState(false);
    const [showBalanceChallenge, setShowBalanceChallenge] = useState(false);
    const [showDrunkPairs, setShowDrunkPairs] = useState(false);

    const [showHungryHippos, setShowHungryHippos] = useState(false);
    const [showGiftBox, setShowGiftBox] = useState(false);
    const [showColorMatch, setShowColorMatch] = useState(false);
    const [showMathSprint, setShowMathSprint] = useState(false);
    const [isArcadeMode, setIsArcadeMode] = useState(true);
    const [isMinigameOnlyMode, setIsMinigameOnlyMode] = useState(false);
    const [entitlements, setEntitlements] = useState<EntitlementSnapshot>(DEFAULT_ENTITLEMENTS);
    const [isIapLoading, setIsIapLoading] = useState(false);
    const [isIapReady, setIsIapReady] = useState(false);
    const [adminUnlockAll, setAdminUnlockAll] = useState(false);
    const [adminCodeInput, setAdminCodeInput] = useState('');
    const [showAdminCode, setShowAdminCode] = useState(false);
    const [turnCountForAds, setTurnCountForAds] = useState(0);
    const [isRewardedLoading, setIsRewardedLoading] = useState(false);
    const [rewardedRenderTick, setRewardedRenderTick] = useState(0);

    const [minigameCounts, setMinigameCounts] = useState<Record<string, number>>({});

    const hasMinigamesUnlocked = adminUnlockAll || entitlements.minigames;
    const hasQuestionsUnlocked = adminUnlockAll || entitlements.questions;
    const adsRemoved = adminUnlockAll || entitlements.removeAds;
    const bannerAdUnitId = getBannerAdUnitId();
    const canUseRewardedSkip = !adsRemoved && isRewardedConfigured() && isRewardedAdReady();

    const renderBannerAd = () => {
        if (adsRemoved || !isAdsConfigured() || Platform.OS === 'web' || isExpoGo()) {
            return null;
        }

        try {
            const mobileAds = require('react-native-google-mobile-ads');
            const BannerAd = mobileAds.BannerAd;
            const BannerAdSize = mobileAds.BannerAdSize;

            if (!BannerAd || !BannerAdSize || !bannerAdUnitId) {
                return null;
            }

            return (
                <View style={{ width: '100%', alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
                    <BannerAd
                        unitId={bannerAdUnitId}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                    />
                </View>
            );
        } catch (error) {
            return null;
        }
    };

    const refreshEntitlements = async () => {
        try {
            const latest = await getRevenueCatEntitlements();
            setEntitlements(latest);
        } catch (error) {
            console.error('Error refreshing entitlements:', error);
        }
    };

    const handlePurchase = async (type: 'minigames' | 'questions' | 'removeAds') => {
        setIsIapLoading(true);
        try {
            const result = await purchaseEntitlement(type);
            setEntitlements(result.entitlements);

            if (result.success) {
                Alert.alert('Compra completada', 'Tu contenido premium ya esta desbloqueado.');
            } else if (!result.cancelled) {
                Alert.alert('No se pudo completar', result.message || 'La compra no pudo procesarse.');
            }
        } finally {
            setIsIapLoading(false);
        }
    };

    const handleRestorePurchases = async () => {
        setIsIapLoading(true);
        try {
            const result = await restoreRevenueCatPurchases();
            setEntitlements(result.entitlements);

            if (result.success) {
                Alert.alert('Compras restauradas', 'Se han restaurado tus desbloqueos.');
            } else {
                Alert.alert('No se pudo restaurar', result.message || 'Intentalo de nuevo en unos minutos.');
            }
        } finally {
            setIsIapLoading(false);
        }
    };

    // Timer Effect
    useEffect(() => {
        let interval: any;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            playHaptic('heavy');
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    const startTimer = (seconds: number) => {
        setTimeLeft(seconds);
        setTimerActive(true);
        setTimerVisible(true);
    };

    // Game configuration
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['romantic', 'spicy', 'fun', 'general']);
    const [selectedIntensity, setSelectedIntensity] = useState<'soft' | 'medium' | 'spicy'>('spicy');

    // Custom cards
    const [customCards, setCustomCards] = useState<Card[]>([]);
    const [showCustomCardModal, setShowCustomCardModal] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [newCustomCard, setNewCustomCard] = useState<Card>({
        id: '',
        text: '',
        type: 'question',
        mode: 'binary',
        category: 'general',
        intensity: 'medium',
    });

    const colorScheme = useColorScheme();

    const isDark = colorScheme === 'dark';
    const colors = {
        orange: '#FF6B35',
        lightOrange: '#FF9A56',
        gold: '#FFD700',
        white: '#FFFFFF',
        pink: '#E91E8C',
        darkPink: '#C2185B',
        purple: '#9C27B0',
        text: isDark ? '#fff' : '#1a1a1a',
        cardBackground: isDark ? '#2d1b2e' : '#fff',
        inputBackground: isDark ? '#3d2a3e' : '#f0f0f0',
        modalBackground: isDark ? '#1a0f1b' : '#ffffff',
        accentGradient: isDark ? 'rgba(233, 30, 140, 0.2)' : 'rgba(233, 30, 140, 0.1)',
    };

    // --- Setup Logic ---
    const addPlayer = async () => {
        if (newPlayerName.trim().length > 0) {
            const updatedPlayers = [...players, newPlayerName.trim()];
            setPlayers(updatedPlayers);
            setNewPlayerName('');
            // Save to AsyncStorage
            await savePlayersToStorage(updatedPlayers);
        }
    };

    const removePlayer = async (index: number) => {
        const updatedPlayers = players.filter((_, i) => i !== index);
        setPlayers(updatedPlayers);
        // Save to AsyncStorage
        await savePlayersToStorage(updatedPlayers);
    };

    // AsyncStorage functions
    const savePlayersToStorage = async (playersList: string[]) => {
        try {
            await AsyncStorage.setItem('lesgo_players', JSON.stringify(playersList));
        } catch (error) {
            console.error('Error saving players:', error);
        }
    };

    const loadPlayersFromStorage = async () => {
        try {
            const savedPlayers = await AsyncStorage.getItem('lesgo_players');
            if (savedPlayers) {
                setPlayers(JSON.parse(savedPlayers));
            }
        } catch (error) {
            console.error('Error loading players:', error);
        }
    };

    // Custom Cards AsyncStorage functions
    const saveCustomCardsToStorage = async (cards: Card[]) => {
        try {
            await AsyncStorage.setItem('lesgo_custom_cards', JSON.stringify(cards));
        } catch (error) {
            console.error('Error saving custom cards:', error);
        }
    };

    const loadCustomCardsFromStorage = async () => {
        try {
            const savedCards = await AsyncStorage.getItem('lesgo_custom_cards');
            if (savedCards) {
                setCustomCards(JSON.parse(savedCards));
            }
        } catch (error) {
            console.error('Error loading custom cards:', error);
        }
    };

    const addCustomCard = async () => {
        if (!newCustomCard.text.trim()) return;

        let updatedCards;
        if (newCustomCard.id) {
            // Edit existing card
            updatedCards = customCards.map(c => c.id === newCustomCard.id ? newCustomCard : c);
        } else {
            // Create new card
            const newCard: Card = {
                ...newCustomCard,
                id: Date.now().toString(),
            };
            updatedCards = [...customCards, newCard];
        }

        setCustomCards(updatedCards);
        await saveCustomCardsToStorage(updatedCards);

        // Reset form
        setNewCustomCard({
            id: '',
            text: '',
            type: 'question',
            mode: 'binary',
            category: 'general',
            intensity: 'medium',
        });
        // Don't close modal automatically in edit mode to let user see result, or close? 
        // User flow: edit -> save -> clear form. Maybe keep open or close? Let's close for now to be consistent.
        // Actually, user might want to add more. But consistent behavior is close.
        // But for "Edit", it feels like "Done".
        // Let's keep it consistent: always clear and close? Or just clear.
        // Current behavior was: clear and close.
        setShowCustomCardModal(false);
    };

    const deleteCustomCard = async (id: string) => {
        const updatedCards = customCards.filter(card => card.id !== id);
        setCustomCards(updatedCards);
        await saveCustomCardsToStorage(updatedCards);
    };

    const editCustomCard = (card: Card) => {
        setNewCustomCard(card);
    };

    const cancelEdit = () => {
        setNewCustomCard({
            id: '',
            text: '',
            type: 'question',
            mode: 'binary',
            category: 'general',
            intensity: 'medium',
        });
    };

    // Load players and custom cards on component mount
    useEffect(() => {
        loadPlayersFromStorage();
        loadCustomCardsFromStorage();
        AsyncStorage.getItem(ADMIN_UNLOCK_STORAGE_KEY).then((value) => {
            if (value === 'true') {
                setAdminUnlockAll(true);
            }
        });
    }, []);

    const handleAdminCodeSubmit = async () => {
        if (adminCodeInput.trim() !== ADMIN_UNLOCK_CODE) {
            Alert.alert('Código incorrecto', 'Ese código no es válido.');
            return;
        }

        setAdminUnlockAll(true);
        setAdminCodeInput('');
        await AsyncStorage.setItem(ADMIN_UNLOCK_STORAGE_KEY, 'true');
        Alert.alert('Listo', 'Modo admin activado: minijuegos, preguntas y anuncios desbloqueados en este dispositivo.');
    };

    const handleAdminDeactivate = async () => {
        setAdminUnlockAll(false);
        await AsyncStorage.removeItem(ADMIN_UNLOCK_STORAGE_KEY);
        Alert.alert('Listo', 'Modo admin desactivado.');
    };

    useEffect(() => {
        const bootstrapIap = async () => {
            const ready = await initializeRevenueCat();
            setIsIapReady(ready);
            if (ready) {
                await refreshEntitlements();
            }
        };

        bootstrapIap();
    }, []);

    useEffect(() => {
        const bootstrapAds = async () => {
            if (Platform.OS === 'web' || adsRemoved || !isAdsConfigured()) {
                return;
            }

            await initializeAdsSdk();
            preloadInterstitialAd();
            preloadRewardedAd();
        };

        bootstrapAds();
    }, [adsRemoved]);

    useEffect(() => {
        if (!modalVisible || adsRemoved || !isRewardedConfigured()) {
            return;
        }

        preloadRewardedAd();
        const interval = setInterval(() => {
            setRewardedRenderTick((prev) => prev + 1);
        }, 700);

        return () => clearInterval(interval);
    }, [modalVisible, adsRemoved]);

    const startGame = () => {
        if (players.length > 0) {
            // Filter cards based on configuration
            const intensityLevels = { 'soft': 1, 'medium': 2, 'spicy': 3 };
            const selectedLevel = intensityLevels[selectedIntensity];

            const allCards = [...GAME_CARDS, ...customCards];

            const filteredCards = allCards.filter(card => {
                const cardCategory = card.category || 'general';
                const cardIntensity = card.intensity || 'medium';
                const cardLevel = intensityLevels[cardIntensity] || 2; // Default to medium

                // Category check
                const categoryMatch = selectedCategories.includes(cardCategory);
                // Intensity check
                const intensityMatch = cardLevel <= selectedLevel;
                // Round 1 filter: No special effects
                const round1Match = !card.specialEffect;

                return categoryMatch && intensityMatch && round1Match;
            });

            const accessibleFilteredCards = applyQuestionAccess(filteredCards);

            // Ensure we have at least some cards
            const fallbackCards = applyQuestionAccess(allCards.filter(c => !c.specialEffect));
            const deckToUse = accessibleFilteredCards.length > 0 ? accessibleFilteredCards : fallbackCards;

            setDeck(shuffleArray(deckToUse));
            setCurrentCardIndex(0);
            setCurrentPlayerIndex(0);
            setCurrentRound(1);
            setTargetScore(30);
            setUsedCardIds([]);
            setTurnCountForAds(0);

            // Initialize scores
            const initialScores: Record<string, number> = {};
            players.forEach(player => initialScores[player] = 0);
            setPlayerScores(initialScores);
            setDirection(1);
            setDoublePoints(false);
            setSkipNext(false);
            setWinner(null);
            setGameState('playing');

            // Trigger initial minigame if specific mode is active
            if (isMinigameOnlyMode) {
                setTimeout(() => {
                    triggerRandomMinigame();
                }, 600); // Slight delay to allow transition
            }
        }
    };

    const resetGame = () => {
        setShowExitConfirm(false);
        setGameState('setup');
        // Keep players list
        setCurrentPlayerIndex(0);
        setPlayerScores({});
        setDirection(1);
        setDoublePoints(false);
        setSkipNext(false);
        setWinner(null);
        setCurrentRound(1);
        setTargetScore(30);
        setUsedCardIds([]);
        setPendingMinigame(null); // Clear pending minigame
        setTurnCountForAds(0);
    };

    const handleExitClick = () => {
        if (gameState === 'playing') {
            setShowExitConfirm(true);
        } else {
            resetGame();
        }
    };

    const continueGame = () => {
        setTargetScore(prev => prev + 30);
        setGameState('playing');
        setWinner(null);
    };

    // --- Game Logic ---
    // Ensure deck has cards, fallback to base list if empty (shouldn't happen after start)
    const activeDeck = deck.length > 0 ? deck : GAME_CARDS;
    const currentCard: Card = activeDeck[currentCardIndex % activeDeck.length];
    const currentPlayer = players[currentPlayerIndex];

    // Helper to get fresh candidates based on config and round
    const getCardCandidates = (isRound2Plus: boolean) => {
        const intensityLevels = { 'soft': 1, 'medium': 2, 'spicy': 3 };
        const selectedLevel = intensityLevels[selectedIntensity];
        const allCards = [...GAME_CARDS, ...customCards];

        const filtered = allCards.filter(card => {
            const cardCategory = card.category || 'general';
            const cardIntensity = card.intensity || 'medium';
            const cardLevel = intensityLevels[cardIntensity] || 2;

            const categoryMatch = selectedCategories.includes(cardCategory);
            const intensityMatch = cardLevel <= selectedLevel;
            const roundMatch = isRound2Plus ? true : !card.specialEffect;

            return categoryMatch && intensityMatch && roundMatch;
        });

        return applyQuestionAccess(filtered);
    };

    const applyQuestionAccess = (cards: Card[]) => {
        if (hasQuestionsUnlocked) {
            return cards;
        }

        const freeCategories = new Set(['general', 'fun']);
        const filtered = cards.filter(card => freeCategories.has(card.category || 'general'));

        if (filtered.length > 0) {
            return filtered.slice(0, 40);
        }

        return cards.slice(0, 40);
    };

    const handleRouletteWinner = (winner: string) => {
        // Update current player to the winner
        const winnerIndex = players.indexOf(winner);
        if (winnerIndex !== -1) {
            setCurrentPlayerIndex(winnerIndex);
        }
        setShowRoulette(false);

        // Trigger haptic for result
        playHaptic('heavy');
    };

    const handleFortuneResult = (result: any) => {
        setShowFortuneRoulette(false);
        if (!result) {
            nextTurn();
            return;
        }

        const currentPlayer = players[currentPlayerIndex];

        // Process Result
        if (result.type === 'points') {
            const points = result.value;
            setPlayerScores(prev => ({
                ...prev,
                [currentPlayer]: Math.max(0, (prev[currentPlayer] || 0) + points)
            }));
            // Show toast or modal? TimerModal used for general info sometimes
            // For now, let's just rely on the Roulette's own result modal which the user already saw.
        } else if (result.type === 'steal') {
            // Steal 5 points (Manual Selection)
            setSelectionAction('roulette_steal');
            setPlayerSelectionModal(true);
            return; // Wait for selection
        } else if (result.type === 'drink') {
            // Drink -> +Points
            const points = result.value || 1;
            setPlayerScores(prev => ({
                ...prev,
                [currentPlayer]: (prev[currentPlayer] || 0) + points
            }));
        } else if (result.type === 'points') {
            // +/- Points
            const points = result.value;
            setPlayerScores(prev => ({
                ...prev,
                [currentPlayer]: Math.max(0, (prev[currentPlayer] || 0) + points)
            }));
        }
        // Action/Challenge -> Just continue

        // 'drink' and 'challenge' are self-explanatory actions shown on the wheel results

        // Advance Turn
        nextTurn();
    };

    const [pendingMinigame, setPendingMinigame] = useState<{
        key: string;
        name: string;
        description: string;
        icon: string;
        onPlay: () => void;
    } | null>(null);

    // ... existing states ...

    const triggerRandomMinigame = () => {
        const minigames = [
            { key: 'brick', name: 'Brick Breaker 🧱', description: 'Rompe los ladrillos para ganar puntos.', icon: 'th-large', action: () => setShowBrickBreaker(true) },
            { key: 'flappy', name: 'Flappy Drink 🐦', description: 'Esquiva las botellas y llega lejos.', icon: 'plane', action: () => setShowFlappyDrink(true) },
            { key: 'roulette', name: 'Ruleta de la Fortuna 🎰', description: 'Prueba tu suerte.', icon: 'circle-o-notch', action: () => setShowFortuneRoulette(true) },
            { key: 'tapper', name: 'Fast Tapper 👆', description: 'Toca lo más rápido posible.', icon: 'hand-pointer-o', action: () => setShowFastTapper(true) },
            { key: 'memory', name: 'Memory Challenge 🧠', description: 'Encuentra las parejas.', icon: 'lightbulb-o', action: () => setShowMemoryChallenge(true) },
            { key: 'reflex', name: 'Duelo de Reflejos ⚡', description: 'Sé el primero en reaccionar.', icon: 'bolt', action: () => setShowReflexDuel(true) },
            { key: 'stop', name: 'Stop the Bus 🚌', description: 'Para el cronómetro en el momento justo.', icon: 'clock-o', action: () => setShowStopTheBus(true) },
            { key: 'gift', name: 'Gift Box 🎁', description: 'Elige una caja y tienta a la suerte.', icon: 'gift', action: () => setShowGiftBox(true) },
            { key: 'highlow', name: 'Mayor o Menor 🃏', description: 'Adivina si la siguiente carta es mayor o menor.', icon: 'arrows-v', action: () => setShowHighLow(true) },
            { key: 'potato', name: 'La Bomba 💣', description: 'Pásalo rápido antes de que explote.', icon: 'bomb', action: () => setShowHotPotato(true) },
            { key: 'sniper', name: 'Francotirador 🎯', description: 'Para el tiempo EXACTAMENTE en el objetivo.', icon: 'crosshairs', action: () => setShowPrecisionSniper(true) },
            { key: 'wire', name: 'Corta Cables ✂️', description: 'Elige el cable correcto... si te atreves.', icon: 'scissors', action: () => setShowWireCut(true) },

            { key: 'finger', name: 'Ruleta de Dedos 👆', description: 'Poned los dedos en la pantalla.', icon: 'hand-paper-o', action: () => setShowFingerRoulette(true) },
            { key: 'soccer', name: 'Finger Soccer ⚽', description: 'Partido de dedos 1vs1.', icon: 'futbol-o', action: () => setShowFingerSoccer(true) },

            { key: 'tug', name: 'Guerra de Taps ⚔️', description: 'Machaca al rival.', icon: 'hand-rock-o', action: () => setShowTugOfWar(true) },
            { key: 'balance', name: 'Equilibrista ⚖️', description: 'No dejes caer la bola.', icon: 'balance-scale', action: () => setShowBalanceChallenge(true) },
            { key: 'pairs', name: 'Parejas 🃏', description: 'Encuentra las parejas.', icon: 'clone', action: () => setShowDrunkPairs(true) },

            { key: 'hippo', name: 'Come Bolas 🦛', description: '¡A comer!', icon: 'paw', action: () => setShowHungryHippos(true) },
            { key: 'color', name: 'Color Match 🌈', description: 'Toca el color correcto contra reloj.', icon: 'paint-brush', action: () => setShowColorMatch(true) },
            { key: 'math', name: 'Math Sprint 🧮', description: 'Resuelve sumas rápidas antes de que acabe el tiempo.', icon: 'calculator', action: () => setShowMathSprint(true) },
        ];

        const availableMinigames = hasMinigamesUnlocked
            ? minigames
            : minigames.filter(game => FREE_MINIGAME_KEYS.has(game.key));

        if (availableMinigames.length === 0) {
            return;
        }

        // Weighted Selection Logic
        let totalWeight = 0;
        const weightedPool = availableMinigames.map(game => {
            const count = minigameCounts[game.key] || 0;
            // Weight formula: 1 / (count + 1)
            // Example: 0 plays -> 1, 1 play -> 0.5, 2 plays -> 0.33
            const weight = 1 / (count + 1);
            totalWeight += weight;
            return { ...game, weight };
        });

        let randomValue = Math.random() * totalWeight;
        let selected = weightedPool[0];

        for (const game of weightedPool) {
            randomValue -= game.weight;
            if (randomValue <= 0) {
                selected = game;
                break;
            }
        }

        setPendingMinigame({
            key: selected.key,
            name: selected.name,
            description: selected.description,
            icon: selected.icon,
            onPlay: () => {
                // Update history count
                setMinigameCounts(prev => ({
                    ...prev,
                    [selected.key]: (prev[selected.key] || 0) + 1
                }));
                setPendingMinigame(null);
                selected.action();
            }
        });
    };

    const nextTurn = async () => {
        // Haptic feedback
        playHaptic('light');

        // Mark current card as used if we are using cards
        // In Minigame mode we might not care, but keeping it consistent is fine
        if (!isMinigameOnlyMode) {
            const currentCardId = activeDeck[currentCardIndex]?.id;
            let newUsedIds = [...usedCardIds];
            if (currentCardId && !newUsedIds.includes(currentCardId)) {
                newUsedIds.push(currentCardId);
                setUsedCardIds(newUsedIds);
            }
        }

        // PRE-CALCULATE NEXT CARD INDEX
        let nextCardIndex = currentCardIndex + 1;
        if (nextCardIndex >= activeDeck.length) {
            nextCardIndex = 0;
        }

        // Logic to determine next player (Sequential)
        // We calculate it here but might not apply it if Roulette Mode is active in normal play
        let nextPlayerIndex = currentPlayerIndex + direction;
        if (nextPlayerIndex >= players.length) nextPlayerIndex = 0;
        if (nextPlayerIndex < 0) nextPlayerIndex = players.length - 1;

        if (skipNext) {
            setSkipNext(false);
            nextPlayerIndex = nextPlayerIndex + direction;
            if (nextPlayerIndex >= players.length) nextPlayerIndex = 0;
            if (nextPlayerIndex < 0) nextPlayerIndex = players.length - 1;
        }

        // 1. Minigame Only Mode (Overrides everything else)
        if (isMinigameOnlyMode) {
            // In Minigame mode, we just cycle players appropriately
            // We ignore Card Effects logic
            setCurrentPlayerIndex(nextPlayerIndex);
            triggerRandomMinigame();
            return;
        }

        // Check for special card effect "roulette"
        if (activeDeck[nextCardIndex].specialEffect === 'roulette') {
            setPendingRouletteAction('effect');
            setTimeout(() => setShowRoulette(true), 500); // Auto-open for effect
            return;
        }

        // ARCADE MODE / SPECIAL EFFECT INTERCEPTION
        const effect = activeDeck[nextCardIndex].specialEffect;

        const hasLockedPremiumMinigameEffect = Boolean(
            effect && PAID_MINIGAME_EFFECTS.has(effect) && !hasMinigamesUnlocked
        );

        // Check Specific Card Effects
        if (!hasLockedPremiumMinigameEffect) {
            if (effect === 'minigame_brick') { setTimeout(() => setShowBrickBreaker(true), 500); return; }
            if (effect === 'minigame_flappy') { setTimeout(() => setShowFlappyDrink(true), 500); return; }
            if (effect === 'minigame_roulette') { setTimeout(() => setShowFortuneRoulette(true), 500); return; }
            if (effect === 'minigame_tapper') { setTimeout(() => setShowFastTapper(true), 500); return; }
            if (effect === 'minigame_memory') { setTimeout(() => setShowMemoryChallenge(true), 500); return; }
            if (effect === 'minigame_reflex') { setTimeout(() => setShowReflexDuel(true), 500); return; }
            if (effect === 'minigame_stop') { setTimeout(() => setShowStopTheBus(true), 500); return; }
            if (effect === 'minigame_box') { setTimeout(() => setShowGiftBox(true), 500); return; }
            if (effect === 'minigame_highlow') { setTimeout(() => setShowHighLow(true), 500); return; }
            if (effect === 'minigame_potato') { setTimeout(() => setShowHotPotato(true), 500); return; }
            if (effect === 'minigame_sniper') { setTimeout(() => setShowPrecisionSniper(true), 500); return; }
            if (effect === 'minigame_wire') { setTimeout(() => setShowWireCut(true), 500); return; }

            if (effect === 'minigame_finger') { setTimeout(() => setShowFingerRoulette(true), 500); return; }
            if (effect === 'minigame_soccer') { setTimeout(() => setShowFingerSoccer(true), 500); return; }

            if (effect === 'minigame_tug') { setTimeout(() => setShowTugOfWar(true), 500); return; }
            if (effect === 'minigame_balance') { setTimeout(() => setShowBalanceChallenge(true), 500); return; }
            if (effect === 'minigame_pairs') { setTimeout(() => setShowDrunkPairs(true), 500); return; }

            if (effect === 'minigame_hippo') { setTimeout(() => setShowHungryHippos(true), 500); return; }
            if (effect === 'minigame_color') { setTimeout(() => setShowColorMatch(true), 500); return; }
            if (effect === 'minigame_math') { setTimeout(() => setShowMathSprint(true), 500); return; }
        }

        // Arcade Mode Random Exception
        if (isArcadeMode && !effect) {
            // 25% Chance to trigger a minigame "card"
            if (Math.random() > 0.75) {
                setCurrentPlayerIndex(nextPlayerIndex); // FIX: Move to next player BEFORE minigame
                triggerRandomMinigame();
                return;
            }
        }

        // TURN LOGIC (Normal Mode)
        if (isRouletteMode) {
            setPendingRouletteAction('turn');
            setShowRoulette(true);
        } else {
            // Normal sequential turn
            setCurrentPlayerIndex(nextPlayerIndex);
        }

        // Check if we need to refill/reshuffle deck
        if (currentCardIndex + 1 >= activeDeck.length) {
            // Deck details replacement...
            // For brevity reusing existing simple logic or triggering generic reload
            // But we must maintain the logic
            let nextRound = currentRound;
            if (currentRound === 1) {
                nextRound = 2;
                setCurrentRound(2);
            }
            const candidates = getCardCandidates(nextRound >= 2);
            let available = candidates.filter(c => !usedCardIds.includes(c.id));
            // Note: usedCardIds might not be updated in this scope if we defined newUsedIds? 
            // Actually usedCardIds is state. use 'newUsedIds' logic if needed but we skipped it for Minigame mode.
            // Let's assume standard flow relies on state update which will happen.

            if (available.length === 0) {
                setUsedCardIds([]);
                available = candidates;
            }
            setDeck(shuffleArray(available));
            setCurrentCardIndex(0);
        } else {
            setCurrentCardIndex((prev) => prev + 1);
        }

        // Reset double points after use
        if (doublePoints) {
            setDoublePoints(false);
        }

        if (!adsRemoved && isAdsConfigured()) {
            setTurnCountForAds((prev) => {
                const next = prev + 1;
                if (next % INTERSTITIAL_FREQUENCY === 0) {
                    showInterstitialAdIfLoaded();
                }
                return next;
            });
            preloadInterstitialAd();
        }
    };

    const addPoints = (player: string, points: number) => {
        setPlayerScores(prev => {
            const newScores = { ...prev };
            newScores[player] = Math.max(0, (newScores[player] || 0) + points);

            // Check for victory
            if (newScores[player] >= targetScore && !winner) {
                setWinner(player);
                setGameState('victory');
                playHaptic('heavy');
            }

            return newScores;
        });
    };

    const handleSpecialEffect = (effect: string) => {
        switch (effect) {
            case 'double':
                setDoublePoints(true);
                break;
            case 'reverse':
                setDirection(prev => prev === 1 ? -1 : 1);
                break;
            case 'skip':
                setSkipNext(true);
                break;
            case 'steal':
                setSelectionAction('steal');
                setPlayerSelectionModal(true);
                return; // Don't proceed to nextTurn yet
            case 'bonus':
                // Add 5 bonus points
                addPoints(currentPlayer, 5);
                break;
            case 'gift':
                setSelectionAction('gift');
                setPlayerSelectionModal(true);
                return; // Don't proceed to nextTurn yet
            case 'bomb':
                // All players lose 3 points except current player
                setPlayerScores(prev => {
                    const newScores = { ...prev };
                    players.forEach(player => {
                        if (player !== currentPlayer) {
                            newScores[player] = (newScores[player] || 0) - 3;
                        }
                    });
                    return newScores;
                });
                break;
            case 'star':
                // Double points if current player has less than 20
                const currentPoints = playerScores[currentPlayer] || 0;
                if (currentPoints < 20 && currentPoints > 0) {
                    addPoints(currentPlayer, currentPoints); // Add same amount to double
                }
                break;
        }
    };

    const handlePlayerSelection = (selectedPlayer: string) => {
        if (selectionAction === 'steal') {
            // Steal up to 10 points, but strictly what the victim has (Floor at 0)
            setPlayerScores(prev => {
                const newScores = { ...prev };
                const victimScore = newScores[selectedPlayer] || 0;
                // Calculate standard steal amount (e.g. 10), but cap at victim's score
                const actualSteal = Math.max(0, Math.min(victimScore, 10));

                newScores[selectedPlayer] = victimScore - actualSteal; // Will be >= 0
                newScores[currentPlayer] = (newScores[currentPlayer] || 0) + actualSteal;
                return newScores;
            });
        } else if (selectionAction === 'roulette_steal') {
            // Specific Roulette Steal (5 Points)
            setPlayerScores(prev => {
                const newScores = { ...prev };
                const victimScore = newScores[selectedPlayer] || 0;
                const actualSteal = Math.max(0, Math.min(victimScore, 5));

                newScores[selectedPlayer] = victimScore - actualSteal;
                newScores[currentPlayer] = (newScores[currentPlayer] || 0) + actualSteal;
                return newScores;
            });
        } else if (selectionAction === 'gift') {
            // Gift 5 points to selected player
            addPoints(selectedPlayer, 5);
        }
        setPlayerSelectionModal(false);
        setSelectionAction(null);
        nextTurn();
    };

    const handleDrink = (customMessage?: string) => {
        playHaptic('medium');
        setDrinkMessage(customMessage || '¡BEBE!');
        setModalVisible(true);
    };

    const closeDrinkModal = () => {
        setModalVisible(false);
        nextTurn();
    };

    const handleRewardedSkipDrink = async () => {
        if (isRewardedLoading || adsRemoved || !isRewardedConfigured()) {
            return;
        }

        setIsRewardedLoading(true);
        try {
            const rewardEarned = await showRewardedAdForReward();

            if (rewardEarned) {
                setModalVisible(false);
                Alert.alert('Recompensa aplicada', 'Has evitado este castigo.');
                nextTurn();
            } else {
                Alert.alert('Sin recompensa', 'Debes ver el anuncio completo para obtener la recompensa.');
            }
        } finally {
            setIsRewardedLoading(false);
            preloadRewardedAd();
            setRewardedRenderTick((prev) => prev + 1);
        }
    };

    const getBaseCardPoints = () => {
        if (typeof currentCard.points === 'number') return Math.max(1, currentCard.points);

        const intensityPoints: Record<string, number> = {
            soft: 1,
            medium: 2,
            spicy: 3,
        };

        const byIntensity = intensityPoints[currentCard.intensity || 'medium'] || 2;
        return currentCard.type === 'challenge' ? byIntensity + 1 : byIntensity;
    };

    const applyDoublePoints = (points: number) => {
        if (doublePoints) {
            setDoublePoints(false);
            return points * 2;
        }
        return points;
    };

    const applySpecialEffectIfNeeded = () => {
        if (currentCard.specialEffect) {
            handleSpecialEffect(currentCard.specialEffect);
            if (currentCard.specialEffect === 'steal') {
                return true;
            }
        }
        return false;
    };

    const handleChallengeFail = () => {
        const basePoints = getBaseCardPoints();
        const failPoints = applyDoublePoints(Math.max(0, Math.floor(basePoints * 0.5)));

        if (failPoints > 0) {
            addPoints(currentPlayer, failPoints);
        }

        if (applySpecialEffectIfNeeded()) {
            return;
        }

        handleDrink(currentCard.drinkAction || 'Fallaste el reto. ¡Bebe!');
    };

    const handleStatementSuccess = () => {
        const basePoints = getBaseCardPoints();
        const successPoints = applyDoublePoints(basePoints + 1);

        addPoints(currentPlayer, successPoints);

        if (applySpecialEffectIfNeeded()) {
            return;
        }

        if (currentCard.drinkTrigger === 'always') {
            handleDrink(currentCard.drinkAction);
            return;
        }

        nextTurn();
    };

    const handleChoice = (choice: 'yes' | 'no') => {
        const basePoints = getBaseCardPoints();
        const drinkPoints = applyDoublePoints(basePoints);
        const safePoints = applyDoublePoints(1); // Participation reward for non-drink answer

        if (applySpecialEffectIfNeeded()) {
            return;
        }

        if (currentCard.drinkTrigger === choice) {
            addPoints(currentPlayer, drinkPoints);
            handleDrink(currentCard.drinkAction);
        } else {
            addPoints(currentPlayer, safePoints);
            nextTurn();
        }
    };

    const handleContinue = () => {
        const basePoints = getBaseCardPoints();
        const finalPoints = applyDoublePoints(basePoints);
        const participationPoints = applyDoublePoints(1);

        if (applySpecialEffectIfNeeded()) {
            return; // Wait for player selection on steal/gift
        }

        if (currentCard.drinkTrigger === 'always') {
            addPoints(currentPlayer, finalPoints);
        } else {
            addPoints(currentPlayer, participationPoints);
        }

        if (currentCard.drinkTrigger === 'always') {
            handleDrink(currentCard.drinkAction);
        } else {
            nextTurn();
        }
    };

    const isYesNoCard = currentCard.mode === 'binary' || currentCard.drinkTrigger === 'yes' || currentCard.drinkTrigger === 'no';
    const singleActionCardIds = new Set([
        'g1', 'g8', 'n3', 'n9', 'n13', 'n21', 'n22',
        'a5', 'a10', 'a11',
        'q2', 'q5',
        'ng3',
        'df6', 'df12',
        'cc3', 'cc4', 'cc8', 'cc14', 'cc15', 'cc23',
        'sx16'
    ]);
    const isSingleActionCard = currentCard.responseMode === 'single' || singleActionCardIds.has(currentCard.id);
    const negativeActionLabel = currentCard.mode === 'rule' ? 'NO ACEPTO' : 'FALLÉ';
    const positiveActionLabel = isRouletteMode
        ? '🎲 GIRAR'
        : currentCard.mode === 'rule'
            ? 'ACEPTO'
            : 'HECHO';



    const renderConfigAndCustomModals = () => (
        <>
            {/* CONFIG MODAL */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={showConfigModal}
                onRequestClose={() => setShowConfigModal(false)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
                >
                <View style={[styles.container, { paddingTop: Math.max(15, insets.top + 8) }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 }}>
                        <Text
                            style={[styles.header, { color: colors.darkPink, marginBottom: 0, flexShrink: 1, marginRight: 12 }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            Configuración 🎮
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowConfigModal(false)}
                            style={[styles.headerIconButton, { flexShrink: 0 }]}
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar configuración"
                        >
                            <FontAwesome name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Game Modes Presets */}
                    <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 10 }}>Modos Rápidos:</Text>
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#48dbfb', padding: 10, flex: 1 }]}
                            onPress={() => {
                                setSelectedCategories(['fun', 'general']);
                                setSelectedIntensity('soft');
                            }}
                        >
                            <Text style={[styles.buttonText, { fontSize: 12 }]}>🍦 Chill</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#ff6b6b', padding: 10, flex: 1 }]}
                            onPress={() => {
                                setSelectedCategories(['romantic', 'spicy']);
                                setSelectedIntensity('spicy');
                            }}
                        >
                            <Text style={[styles.buttonText, { fontSize: 12 }]}>🔥 Cita</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#a55eea', padding: 10, flex: 1 }]}
                            onPress={() => {
                                setSelectedCategories(['romantic', 'spicy', 'fun', 'general']);
                                setSelectedIntensity('spicy');
                            }}
                        >
                            <Text style={[styles.buttonText, { fontSize: 12 }]}>😈 Caos</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={{ width: '100%' }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={[styles.subheader, { color: colors.text, marginBottom: 20, marginTop: 10 }]}>Personaliza tu experiencia</Text>

                        {/* Roulette Mode Toggle */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.05)', padding: 10, borderRadius: 10 }}>
                            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>🎲 Modo Ruleta (Caos)</Text>
                                <Text style={{ color: colors.text, fontSize: 12, opacity: 0.7 }}>Turnos aleatorios en cada carta</Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#767577", true: colors.purple }}
                                thumbColor={isRouletteMode ? "#f4f3f4" : "#f4f3f4"}
                                onValueChange={() => setIsRouletteMode(prev => !prev)}
                                value={isRouletteMode}
                            />
                        </View>

                        {/* Arcade Mode Toggle */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.05)', padding: 10, borderRadius: 10 }}>
                            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>🕹️ Modo Arcade (Minijuegos)</Text>
                                <Text style={{ color: colors.text, fontSize: 12, opacity: 0.7 }}>Aparición frecuente de minijuegos</Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#767577", true: colors.orange }}
                                thumbColor={isArcadeMode ? "#f4f3f4" : "#f4f3f4"}
                                onValueChange={(v) => {
                                    setIsArcadeMode(v);
                                    if (v) setIsMinigameOnlyMode(false);
                                }}
                                value={isArcadeMode}
                            />
                        </View>

                        {/* Minigames Only Toggle */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.05)', padding: 10, borderRadius: 10 }}>
                            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>🎮 Solo Minijuegos</Text>
                                <Text style={{ color: colors.text, fontSize: 12, opacity: 0.7 }}>Sin cartas, solo acción desenfrenada</Text>
                            </View>
                            <Switch
                                trackColor={{ false: "#767577", true: colors.purple }}
                                thumbColor={isMinigameOnlyMode ? "#f4f3f4" : "#f4f3f4"}
                                onValueChange={(v) => {
                                    if (v && !hasMinigamesUnlocked) {
                                        Alert.alert('Contenido Premium', 'Desbloquea minijuegos para activar este modo.');
                                        return;
                                    }
                                    setIsMinigameOnlyMode(v);
                                    if (v) setIsArcadeMode(false);
                                }}
                                value={isMinigameOnlyMode}
                            />
                        </View>

                        {/* Categories Selection */}
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            🏷️ Categorías
                        </Text>
                        <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13, marginBottom: 10 }}>
                            Selecciona las categorías que quieres incluir
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 }}>
                            {[
                                { key: 'romantic', label: 'Romántica', icon: '💕', color: colors.pink },
                                { key: 'spicy', label: 'Picante', icon: '🌶️', color: colors.orange },
                                { key: 'fun', label: 'Divertida', icon: '🎉', color: colors.lightOrange },
                                { key: 'general', label: 'General', icon: '⭐', color: colors.purple },
                            ].map(cat => (
                                <TouchableOpacity
                                    key={cat.key}
                                    style={{
                                        flex: 1,
                                        minWidth: '45%',
                                        backgroundColor: selectedCategories.includes(cat.key) ? cat.color : colors.inputBackground,
                                        paddingVertical: 15,
                                        paddingHorizontal: 10,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: selectedCategories.includes(cat.key) ? cat.color : 'transparent',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        if (selectedCategories.includes(cat.key)) {
                                            setSelectedCategories(selectedCategories.filter(c => c !== cat.key));
                                        } else {
                                            setSelectedCategories([...selectedCategories, cat.key]);
                                        }
                                    }}
                                >
                                    <Text style={{ fontSize: 28, marginBottom: 5 }}>{cat.icon}</Text>
                                    <Text style={{ color: selectedCategories.includes(cat.key) ? 'white' : colors.text, fontSize: 13, fontWeight: '600' }}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Intensity Selection */}
                        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                            🔥 Intensidad
                        </Text>
                        <Text style={{ color: colors.text, opacity: 0.7, fontSize: 13, marginBottom: 10 }}>
                            ¿Qué tan atrevidas quieres las cartas?
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 25 }}>
                            {[
                                { key: 'soft', label: 'Suave', icon: '😊', desc: 'Para empezar' },
                                { key: 'medium', label: 'Medio', icon: '😏', desc: 'Equilibrado' },
                                { key: 'spicy', label: 'Picante', icon: '🔥', desc: 'Sin límites' },
                            ].map(level => (
                                <TouchableOpacity
                                    key={level.key}
                                    style={{
                                        flex: 1,
                                        backgroundColor: selectedIntensity === level.key ? colors.darkPink : colors.inputBackground,
                                        paddingVertical: 15,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: selectedIntensity === level.key ? colors.darkPink : 'transparent',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => setSelectedIntensity(level.key as any)}
                                >
                                    <Text style={{ fontSize: 28, marginBottom: 5 }}>{level.icon}</Text>
                                    <Text style={{ color: selectedIntensity === level.key ? 'white' : colors.text, fontSize: 13, fontWeight: '600' }}>
                                        {level.label}
                                    </Text>
                                    <Text style={{ color: selectedIntensity === level.key ? 'white' : colors.text, fontSize: 10, opacity: 0.7, marginTop: 2 }}>
                                        {level.desc}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom Cards Button */}
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.purple, marginBottom: 15 }]}
                            onPress={() => setShowCustomCardModal(true)}
                        >
                            <Text style={styles.buttonText}>➕ Añadir Cartas Personalizadas ({customCards.length})</Text>
                        </TouchableOpacity>

                        <View style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            borderRadius: 14,
                            padding: 14,
                            marginBottom: 20,
                        }}>
                            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>
                                💳 Premium
                            </Text>
                            <Text style={{ color: colors.text, opacity: 0.75, fontSize: 12, marginBottom: 12 }}>
                                Gestiona desbloqueos con RevenueCat. Las compras se cobran via Google Play/App Store y se pagan a tu cuenta de desarrollador.
                            </Text>

                            {!isIapReady && (
                                <Text style={{ color: colors.orange, fontSize: 12, marginBottom: 10 }}>
                                    Configura tus API Keys de RevenueCat en app.json para activar compras.
                                </Text>
                            )}

                            <View style={{ gap: 8 }}>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: hasMinigamesUnlocked ? '#2e8b57' : colors.darkPink, paddingVertical: 12 }]}
                                    onPress={() => handlePurchase('minigames')}
                                    disabled={hasMinigamesUnlocked || isIapLoading || !isIapReady}
                                >
                                    <Text style={[styles.buttonText, { fontSize: 14 }]}>🎮 {hasMinigamesUnlocked ? 'Minijuegos desbloqueados' : 'Desbloquear mas minijuegos'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: hasQuestionsUnlocked ? '#2e8b57' : colors.darkPink, paddingVertical: 12 }]}
                                    onPress={() => handlePurchase('questions')}
                                    disabled={hasQuestionsUnlocked || isIapLoading || !isIapReady}
                                >
                                    <Text style={[styles.buttonText, { fontSize: 14 }]}>🃏 {hasQuestionsUnlocked ? 'Preguntas desbloqueadas' : 'Desbloquear mas preguntas'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: adsRemoved ? '#2e8b57' : colors.darkPink, paddingVertical: 12 }]}
                                    onPress={() => handlePurchase('removeAds')}
                                    disabled={adsRemoved || isIapLoading || !isIapReady}
                                >
                                    <Text style={[styles.buttonText, { fontSize: 14 }]}>🚫📢 {adsRemoved ? 'Anuncios desactivados' : 'Quitar anuncios'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.inputBackground, paddingVertical: 11 }]}
                                    onPress={handleRestorePurchases}
                                    disabled={isIapLoading || !isIapReady}
                                >
                                    <Text style={[styles.buttonText, { fontSize: 13, color: colors.text }]}>Restaurar compras</Text>
                                </TouchableOpacity>
                            </View>

                            {isIapLoading && (
                                <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <ActivityIndicator size="small" color={colors.pink} />
                                    <Text style={{ color: colors.text, fontSize: 12 }}>Procesando...</Text>
                                </View>
                            )}

                            <Text style={{ color: colors.text, opacity: 0.75, fontSize: 11, marginTop: 10 }}>
                                Estado anuncios: {isAdsConfigured() ? 'Configurados ✅' : 'No configurados ❌'} {adsRemoved ? (adminUnlockAll ? '· Sin anuncios (admin)' : '· Sin anuncios por compra') : ''}
                            </Text>

                            {adminUnlockAll ? (
                                <View style={{ marginTop: 14 }}>
                                    <Text style={{ color: colors.text, fontSize: 12, marginBottom: 8 }}>
                                        🔓 Modo admin activo: minijuegos, preguntas y anuncios desbloqueados.
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.button, { backgroundColor: colors.inputBackground, paddingVertical: 11 }]}
                                        onPress={handleAdminDeactivate}
                                        accessibilityRole="button"
                                        accessibilityLabel="Desactivar modo admin"
                                    >
                                        <Text style={[styles.buttonText, { fontSize: 13, color: colors.text }]}>Desactivar modo admin</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, fontSize: 13, padding: 11, paddingRight: 40 }]}
                                            placeholder="Código admin"
                                            placeholderTextColor={isDark ? '#aaa' : '#666'}
                                            value={adminCodeInput}
                                            onChangeText={setAdminCodeInput}
                                            secureTextEntry={!showAdminCode}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowAdminCode((prev) => !prev)}
                                            style={{ position: 'absolute', right: 0, height: '100%', width: 40, alignItems: 'center', justifyContent: 'center' }}
                                            accessibilityRole="button"
                                            accessibilityLabel={showAdminCode ? 'Ocultar código admin' : 'Mostrar código admin'}
                                        >
                                            <FontAwesome name={showAdminCode ? 'eye-slash' : 'eye'} size={16} color={colors.text} style={{ opacity: 0.6 }} />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.button, { flex: 0, backgroundColor: colors.inputBackground, paddingVertical: 11, paddingHorizontal: 20 }]}
                                        onPress={handleAdminCodeSubmit}
                                    >
                                        <Text style={[styles.buttonText, { fontSize: 13, color: colors.text }]}>OK</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Button Removed */}
                </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Custom Card Modal - Always available, displays on top */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showCustomCardModal}
                onRequestClose={() => setShowCustomCardModal(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground, width: '90%', maxHeight: '90%', padding: 20 }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.purple, marginBottom: 15 }]}>
                            <FontAwesome name="plus-circle" size={28} color={colors.purple} />
                            <Text style={[styles.modalTitle, { color: colors.text, fontSize: 20 }]}>Crear Carta</Text>
                        </View>

                        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={true}>
                            <View style={{ paddingHorizontal: 5 }}>
                                <Text style={{ color: colors.text, marginTop: 16, marginBottom: 8, fontWeight: '700', fontSize: 14 }}>🎯 Tipo de Carta:</Text>
                                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 5 }}>
                                    {[
                                        { key: 'question', label: 'Pregunta', icon: '❓', mode: 'binary', hint: 'Sí/No (Yo Nunca)' },
                                        { key: 'challenge', label: 'Reto', icon: '⚡', mode: 'statement', hint: 'Acción directa' },
                                        { key: 'rule', label: 'Regla', icon: '📜', mode: 'rule', hint: 'Nueva norma' },
                                    ].map(type => (
                                        <TouchableOpacity
                                            key={type.key}
                                            style={{
                                                flex: 1,
                                                backgroundColor: newCustomCard.type === type.key ? colors.pink : colors.inputBackground,
                                                paddingVertical: 12,
                                                borderRadius: 12,
                                                borderWidth: 2,
                                                borderColor: newCustomCard.type === type.key ? colors.darkPink : 'transparent',
                                                alignItems: 'center',
                                            }}
                                            onPress={() => setNewCustomCard({
                                                ...newCustomCard,
                                                type: type.key as any,
                                                mode: type.mode as any // Auto-set mode
                                            })}
                                        >
                                            <Text style={{ fontSize: 24, marginBottom: 4 }}>{type.icon}</Text>
                                            <Text style={{ color: newCustomCard.type === type.key ? 'white' : colors.text, fontSize: 13, fontWeight: 'bold' }}>
                                                {type.label}
                                            </Text>
                                            <Text style={{ color: newCustomCard.type === type.key ? 'rgba(255,255,255,0.8)' : colors.text, fontSize: 10, opacity: newCustomCard.type === type.key ? 1 : 0.6 }}>
                                                {type.hint}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={{ color: colors.text, marginTop: 16, marginBottom: 8, fontWeight: '700', fontSize: 14 }}>📝 Texto de la carta:</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, height: 100, textAlignVertical: 'top', padding: 15, fontSize: 16, borderRadius: 12 }]}
                                    placeholder={
                                        newCustomCard.type === 'question' ? "Ej: ¿Alguna vez te has liado con la ex de una amiga?" :
                                            newCustomCard.type === 'challenge' ? "Ej: La persona más joven bebe 2 tragos." :
                                                "Ej: Prohibido decir la palabra 'NO' hasta el siguiente turno."
                                    }
                                    placeholderTextColor={colors.text + '60'}
                                    value={newCustomCard.text}
                                    onChangeText={(text) => setNewCustomCard({ ...newCustomCard, text })}
                                    multiline
                                />

                                <Text style={{ color: colors.text, marginTop: 16, marginBottom: 8, fontWeight: '700', fontSize: 14 }}>🏷️ Categoría:</Text>
                                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'romantic', label: 'Romántica', icon: '💕', color: colors.pink },
                                        { key: 'spicy', label: 'Picante', icon: '🌶️', color: colors.orange },
                                        { key: 'fun', label: 'Divertida', icon: '🎉', color: colors.lightOrange },
                                        { key: 'general', label: 'General', icon: '⭐', color: colors.purple },
                                    ].map(cat => (
                                        <TouchableOpacity
                                            key={cat.key}
                                            style={{
                                                flex: 1,
                                                minWidth: '45%',
                                                backgroundColor: newCustomCard.category === cat.key ? cat.color : colors.inputBackground,
                                                paddingVertical: 10,
                                                borderRadius: 10,
                                                borderWidth: 2,
                                                borderColor: newCustomCard.category === cat.key ? cat.color : 'transparent',
                                                alignItems: 'center',
                                            }}
                                            onPress={() => setNewCustomCard({ ...newCustomCard, category: cat.key as any })}
                                        >
                                            <Text style={{ fontSize: 20, marginBottom: 2 }}>{cat.icon}</Text>
                                            <Text style={{ color: newCustomCard.category === cat.key ? 'white' : colors.text, fontSize: 10, fontWeight: '600' }}>
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={{ color: colors.text, marginTop: 16, marginBottom: 8, fontWeight: '700', fontSize: 14 }}>🔥 Intensidad:</Text>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    {[
                                        { key: 'soft', label: 'Suave', icon: '😊' },
                                        { key: 'medium', label: 'Medio', icon: '😏' },
                                        { key: 'spicy', label: 'Picante', icon: '🔥' },
                                    ].map(level => (
                                        <TouchableOpacity
                                            key={level.key}
                                            style={{
                                                flex: 1,
                                                backgroundColor: newCustomCard.intensity === level.key ? colors.darkPink : colors.inputBackground,
                                                paddingVertical: 10,
                                                borderRadius: 10,
                                                borderWidth: 2,
                                                borderColor: newCustomCard.intensity === level.key ? colors.darkPink : 'transparent',
                                                alignItems: 'center',
                                            }}
                                            onPress={() => setNewCustomCard({ ...newCustomCard, intensity: level.key as any })}
                                        >
                                            <Text style={{ fontSize: 20, marginBottom: 2 }}>{level.icon}</Text>
                                            <Text style={{ color: newCustomCard.intensity === level.key ? 'white' : colors.text, fontSize: 10, fontWeight: '600' }}>
                                                {level.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {customCards.length > 0 && (
                                    <View style={{ marginTop: 20, flex: 1 }}>
                                        <Text style={{ color: colors.text, marginBottom: 10, fontWeight: '700', fontSize: 14 }}>
                                            📚 Tus cartas ({customCards.length}):
                                        </Text>
                                        <View style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 5, maxHeight: 200 }}>
                                            <ScrollView nestedScrollEnabled={true} style={{ width: '100%' }}>
                                                {customCards.map((card, index) => (
                                                    <View key={card.id} style={{
                                                        backgroundColor: colors.cardBackground,
                                                        marginBottom: 8,
                                                        padding: 12,
                                                        borderRadius: 10,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        borderLeftWidth: 4,
                                                        borderLeftColor:
                                                            card.category === 'romantic' ? colors.pink :
                                                                card.category === 'spicy' ? colors.orange :
                                                                    card.category === 'fun' ? colors.lightOrange :
                                                                        colors.purple,
                                                        elevation: 2,
                                                        shadowColor: "#000",
                                                        shadowOffset: { width: 0, height: 1 },
                                                        shadowOpacity: 0.2,
                                                        shadowRadius: 1.41,
                                                    }}>
                                                        <Text style={{ marginRight: 10, fontSize: 16 }}>
                                                            {card.type === 'question' ? '❓' : card.type === 'challenge' ? '⚡' : '📜'}
                                                        </Text>
                                                        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                                                            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }} numberOfLines={2}>
                                                                {card.text}
                                                            </Text>
                                                            <Text style={{ color: colors.text, fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                                                                {(card.category || 'general').toUpperCase()} • {(card.intensity || 'medium').toUpperCase()}
                                                            </Text>
                                                        </View>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <TouchableOpacity onPress={() => editCustomCard(card)} style={{ padding: 8 }}>
                                                                <FontAwesome name="pencil" size={18} color={colors.purple} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => deleteCustomCard(card.id)} style={{ padding: 8 }}>
                                                                <FontAwesome name="trash" size={18} color={colors.orange} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 15, width: '100%' }}>
                            {newCustomCard.id ? (
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.inputBackground, flex: 1 }]}
                                    onPress={cancelEdit}
                                >
                                    <Text style={[styles.buttonText, { color: colors.text }]}>Cancelar Edición</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.inputBackground, flex: 1 }]}
                                    onPress={() => setShowCustomCardModal(false)}
                                >
                                    <Text style={[styles.buttonText, { color: colors.text }]}>Cerrar</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.pink, flex: 1, opacity: newCustomCard.text.trim() ? 1 : 0.5 }]}
                                onPress={addCustomCard}
                                disabled={!newCustomCard.text.trim()}
                            >
                                <Text style={styles.buttonText}>{newCustomCard.id ? 'Guardar Cambios' : 'Añadir'} ✓</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );

    // --- RENDER ---
    if (gameState === 'setup') {
        return (
            <View style={[styles.container, { paddingTop: 50 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 }}>
                    <Text
                        style={[styles.header, { color: colors.darkPink, flexShrink: 1, marginRight: 12 }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        Lesbo Party 🌈
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10, flexShrink: 0 }}>
                        <TouchableOpacity
                            onPress={() => setShowConfigModal(true)}
                            style={styles.headerIconButton}
                            accessibilityRole="button"
                            accessibilityLabel="Configuración"
                        >
                            <FontAwesome name="cog" size={24} color={colors.purple} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowInfoModal(true)}
                            style={styles.headerIconButton}
                            accessibilityRole="button"
                            accessibilityLabel="Información del juego"
                        >
                            <FontAwesome name="info-circle" size={24} color={colors.darkPink} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={[styles.subheader, { color: colors.text }]}>Añadir Jugadoras</Text>

                {/* Inline Game Modes removed - Moved to Config Modal */}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                        placeholder="Nombre"
                        placeholderTextColor={isDark ? '#aaa' : '#666'}
                        value={newPlayerName}
                        onChangeText={setNewPlayerName}
                        onSubmitEditing={addPlayer}
                    />
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.pink }]} onPress={addPlayer}>
                        <FontAwesome name="plus" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.playerList} contentContainerStyle={{ gap: 10 }}>
                    {players.map((player, index) => (
                        <View key={index} style={[styles.playerItem, { backgroundColor: colors.cardBackground }]}>
                            <Text style={[styles.playerText, { color: colors.text }]}>{player}</Text>
                            <TouchableOpacity onPress={() => removePlayer(index)}>
                                <FontAwesome name="trash" size={20} color={colors.orange} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {players.length === 0 && (
                        <Text style={{ textAlign: 'center', opacity: 0.5, marginTop: 20 }}>Añade jugadoras para empezar</Text>
                    )}
                </ScrollView>
                <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: players.length > 0 ? colors.orange : (isDark ? '#4a4a4a' : '#ccc') }]}
                    onPress={startGame}
                    disabled={players.length === 0}
                >
                    <Text style={[styles.startButtonText, players.length === 0 && { color: isDark ? '#999' : '#666' }]}>EMPEZAR JUEGO</Text>
                </TouchableOpacity>

                {renderBannerAd()}

                {/* Info Modal - Only in Setup Screen */}
                <InfoModal
                    visible={showInfoModal}
                    onClose={() => setShowInfoModal(false)}
                    colors={colors}
                    targetScore={targetScore}
                />
                {renderConfigAndCustomModals()}
            </View >
        );
    }

    if (gameState === 'victory') {
        return (
            <>
                <VictoryScreen
                    winner={winner || ''}
                    scores={playerScores}
                    onContinue={continueGame}
                    onReset={resetGame}
                    colors={colors}
                    targetScore={targetScore}
                />
                {renderConfigAndCustomModals()}
            </>
        );
    }

    return (
        <View
            style={[
                styles.container,
                styles.playingContainer,
                isCompactScreen && styles.playingContainerCompact,
                { paddingBottom: bottomInteractionPadding }
            ]}
        >
            <View style={styles.headerRow}>
                {/* Left: Ranking/Clasificación */}
                <TouchableOpacity style={styles.rankingButton} onPress={() => setShowScoreboard(true)}>
                    <FontAwesome name="trophy" size={20} color={colors.white} />
                    <Text style={{ color: colors.white, fontSize: 12, fontWeight: 'bold', marginLeft: 5 }}>Ranking</Text>
                </TouchableOpacity>

                {/* Center: Current Player Score for visibility */}
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.text, fontSize: 12, opacity: 0.6, fontWeight: 'bold' }}>PUNTUACIÓN</Text>
                    <Text style={{ color: colors.pink, fontSize: 24, fontWeight: '900' }}>
                        {playerScores[currentPlayer] || 0}
                    </Text>
                </View>

                {/* Right: Exit */}
                <TouchableOpacity onPress={handleExitClick} style={styles.iconButton}>
                    <FontAwesome name="times" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Special Effects Indicators */}
            {
                (doublePoints || skipNext || direction === -1) && (
                    <View style={styles.effectsBar}>
                        {doublePoints && <Text style={styles.effectBadge}>🔥 DOBLE PUNTOS</Text>}
                        {skipNext && <Text style={styles.effectBadge}>⏭️ PRÓXIMO TURNO SALTADO</Text>}
                        {direction === -1 && <Text style={styles.effectBadge}>🔄 SENTIDO INVERTIDO</Text>}
                    </View>
                )
            }

            {/* Top Bar Logic */
                // 1. Minigame Active (Playing) -> HIDE HEADER (Prevents overlap with game canvas)
                (showBrickBreaker || showFlappyDrink || showFortuneRoulette || showFastTapper || showMemoryChallenge || showReflexDuel || showStopTheBus || showGiftBox || showRoulette) ? (
                    null
                ) : (
                    // 3. Standard Card Mode -> NEW LARGE HEADER (Name Only) - Applies to Minigame Intro too
                    <View style={[styles.turnHeaderContainer, isCompactScreen && styles.turnHeaderContainerCompact]}>
                        <Text style={{ fontSize: turnLabelSize, color: colors.text, opacity: 0.6, marginBottom: 6, letterSpacing: 1.5 }}>
                            TURNO DE
                        </Text>
                        <Text style={{
                            fontSize: turnNameSize,
                            fontWeight: '900',
                            color: colors.text,
                            textAlign: 'center',
                            lineHeight: turnNameLineHeight
                        }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
                            {players[currentPlayerIndex]}
                        </Text>
                    </View>
                )}

            {pendingMinigame ? (
                // Minigame Intro Card
                <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{
                        width: '90%',
                        aspectRatio: 0.7, // Card shape
                        backgroundColor: colors.cardBackground,
                        borderRadius: 20,
                        padding: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 5,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                    }}>

                        {/* Internal Header Removed as it is now duplicated in main header */}

                        <FontAwesome name={pendingMinigame.icon as any} size={80} color={colors.purple} style={{ marginBottom: 30 }} />
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 15, textAlign: 'center' }}>
                            {pendingMinigame.name}
                        </Text>
                        <Text style={{ fontSize: 18, color: colors.text, textAlign: 'center', opacity: 0.8, marginBottom: 30, lineHeight: 24 }}>
                            {pendingMinigame.description}
                        </Text>
                    </View>

                    <View style={[styles.buttonContainer, isCompactScreen && styles.buttonContainerCompact, { marginBottom: buttonBottomMargin }]}>
                        <TouchableOpacity
                            style={[styles.button, styles.actionButton, isCompactScreen && styles.actionButtonCompact, { backgroundColor: colors.purple, width: '100%' }]}
                            onPress={pendingMinigame.onPlay}
                        >
                            <Text style={styles.buttonText}>🎮 JUGAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <GameCard
                        card={currentCard}
                        formattedText={formatCardText(currentCard.text, players, players[currentPlayerIndex])}
                        isCustom={customCards.some(c => c.id === currentCard.id)}
                        colors={colors}
                        onTimerStart={() => startTimer(10)}
                    />

                    <View style={[styles.buttonContainer, isCompactScreen && styles.buttonContainerCompact, { marginBottom: buttonBottomMargin }]}>
                        {isSingleActionCard ? (
                            <TouchableOpacity
                                style={[styles.button, styles.actionButton, isCompactScreen && styles.actionButtonCompact, { backgroundColor: colors.pink, width: '100%' }]}
                                onPress={handleContinue}
                            >
                                <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>SEGUIR</Text>
                            </TouchableOpacity>
                        ) : isYesNoCard ? (
                            <>
                                {/* NO Logic */}
                                <TouchableOpacity
                                    style={[styles.button, styles.actionButton, isCompactScreen && styles.actionButtonCompact, { backgroundColor: colors.orange }]}
                                    onPress={() => handleChoice('no')}
                                >
                                    <Text style={styles.buttonText}>NO</Text>
                                </TouchableOpacity>

                                {/* YES Logic */}
                                <TouchableOpacity
                                    style={[styles.button, styles.actionButton, isCompactScreen && styles.actionButtonCompact, { backgroundColor: colors.pink }]}
                                    onPress={() => handleChoice('yes')}
                                >
                                    <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>SÍ</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {/* Statement / Rule / Challenge Handling */}
                                {/* Button 2: FAILED / DRINK (New) */}
                                <TouchableOpacity
                                    style={[styles.button, styles.actionButton, isCompactScreen && styles.actionButtonCompact, { backgroundColor: colors.orange, marginRight: 10 }]}
                                    onPress={handleChallengeFail}
                                >
                                    <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>{negativeActionLabel}</Text>
                                </TouchableOpacity>

                                {/* Button 1: SUCCESS / NEXT */}
                                <TouchableOpacity
                                    style={[styles.button, styles.actionButton, isCompactScreen && styles.actionButtonCompact, { backgroundColor: isRouletteMode ? colors.purple : colors.pink }]}
                                    onPress={handleStatementSuccess}
                                >
                                    <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
                                        {positiveActionLabel}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </>
            )
            }

            {renderBannerAd()}



            {/* Drink Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeDrinkModal}
            >
                <View style={styles.modalView}>
                    <View
                        style={[
                            styles.modalContent,
                            styles.drinkModalContent,
                            {
                                backgroundColor: colors.modalBackground,
                                maxHeight: drinkModalMaxHeight,
                                paddingHorizontal: isVerySmallScreen ? 14 : 20,
                                paddingVertical: isVerySmallScreen ? 18 : 26,
                            }
                        ]}
                    >
                        <Text
                            style={[styles.drinkText, { color: colors.darkPink, fontSize: drinkTitleSize }]}
                            numberOfLines={4}
                            adjustsFontSizeToFit
                            minimumFontScale={0.55}
                        >
                            {drinkMessage}
                        </Text>
                        <Text
                            style={[styles.victimText, { color: colors.text, fontSize: drinkPlayerSize }]}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.65}
                        >
                            {currentPlayer}
                        </Text>
                        <FontAwesome name="glass" size={drinkIconSize} color={colors.darkPink} />
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.orange, marginTop: isVerySmallScreen ? 16 : 24 }]}
                            onPress={closeDrinkModal}
                        >
                            <Text
                                style={[styles.buttonText, { fontSize: drinkButtonTextSize }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.7}
                            >
                                ¡He bebido!
                            </Text>
                        </TouchableOpacity>

                        {(!adsRemoved && isRewardedConfigured()) && (
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    {
                                        backgroundColor: (canUseRewardedSkip || isRewardedLoading) ? colors.purple : colors.inputBackground,
                                        marginTop: 10,
                                        opacity: canUseRewardedSkip && !isRewardedLoading ? 1 : 0.7
                                    }
                                ]}
                                onPress={handleRewardedSkipDrink}
                                disabled={!canUseRewardedSkip || isRewardedLoading}
                            >
                                {isRewardedLoading ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <Text style={[styles.buttonText, { fontSize: 14, color: canUseRewardedSkip ? colors.white : colors.text }]}>🎁 Ver anuncio y saltar castigo</Text>
                                )}
                            </TouchableOpacity>
                        )}

                        {(!adsRemoved && isRewardedConfigured() && !canUseRewardedSkip && !isRewardedLoading) && (
                            <Text style={{ color: colors.text, opacity: 0.6, fontSize: 11, marginTop: 8 }}>
                                Cargando anuncio...
                            </Text>
                        )}
                    </View>
                </View>
            </Modal>

            {/* All Scores Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showScoreboard}
                onRequestClose={() => setShowScoreboard(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, styles.scoreModalContent, { backgroundColor: colors.modalBackground }]}>
                        <View style={[styles.modalHeader, styles.scoreModalHeader, { borderBottomColor: colors.pink }]}>
                            <FontAwesome name="trophy" size={30} color={colors.pink} />
                            <Text
                                style={[styles.modalTitle, styles.scoreModalTitle, { color: colors.text, fontSize: scoreModalTitleSize }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.72}
                            >
                                Puntuaciones
                            </Text>
                        </View>
                        <ScrollView style={{ width: '100%', maxHeight: 500, marginTop: 10 }}>
                            {/* Scoreboard Section */}
                            {players
                                .map((player, index) => ({ player, score: playerScores[player] || 0, index }))
                                .sort((a, b) => b.score - a.score)
                                .map(({ player, score, index }, position) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.scoreRowModal,
                                            {
                                                backgroundColor: player === currentPlayer
                                                    ? colors.accentGradient
                                                    : 'transparent'
                                            }
                                        ]}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <Text style={{ fontSize: medalSize, width: 30 }}>
                                                {position === 0 ? '🥇' : position === 1 ? '🥈' : position === 2 ? '🥉' : '  '}
                                            </Text>
                                            <Text
                                                style={[styles.scorePlayerName, { color: colors.text, fontSize: scorePlayerNameSize }]}
                                                numberOfLines={1}
                                                adjustsFontSizeToFit
                                                minimumFontScale={0.8}
                                            >
                                                {player === currentPlayer ? '▶ ' : ''}{player}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[styles.scorePoints, { color: colors.pink, fontSize: scorePointsSize, fontWeight: 'bold' }]}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                            minimumFontScale={0.8}
                                        >
                                            {score} pts
                                        </Text>
                                    </View>
                                ))}

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.pink, marginTop: 30, marginBottom: 20 }]}
                                onPress={() => setShowScoreboard(false)}
                            >
                                <Text style={styles.buttonText}>Cerrar</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Config Modal Removed */}

            {/* Exit Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showExitConfirm}
                onRequestClose={() => setShowExitConfirm(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, styles.exitModalContent, { backgroundColor: colors.modalBackground }]}>
                        <FontAwesome name="exclamation-triangle" size={60} color={colors.orange} style={{ marginBottom: 20 }} />
                        <Text
                            style={[styles.modalTitle, styles.exitModalTitle, { color: colors.text, fontSize: exitModalTitleSize }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            ¿Estás segura?
                        </Text>
                        <Text style={[styles.exitModalDescription, { fontSize: exitModalTextSize, color: colors.text }]}>
                            Vas a perder la partida y todos los puntos
                        </Text>
                        <View style={[styles.exitActionsRow, isCompactScreen && styles.exitActionsRowCompact]}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.pink, flex: 1 }]}
                                onPress={() => setShowExitConfirm(false)}
                            >
                                <Text
                                    style={[styles.buttonText, { fontSize: exitButtonTextSize }]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.8}
                                >
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.orange, flex: 1 }]}
                                onPress={resetGame}
                            >
                                <Text
                                    style={[styles.buttonText, { fontSize: exitButtonTextSize }]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.8}
                                >
                                    Salir
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Player Selection Modal (for steal/gift) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={playerSelectionModal}
                onRequestClose={() => setPlayerSelectionModal(false)}
            >
                <View style={styles.modalView}>
                    <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.orange }]}>
                            <FontAwesome name={selectionAction === 'gift' ? "gift" : "hand-paper-o"} size={30} color={colors.orange} />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {selectionAction === 'gift' ? 'Regala 5 puntos' : 'Elige una jugadora'}
                            </Text>
                        </View>
                        <ScrollView style={{ width: '100%', maxHeight: 300, marginTop: 10 }}>
                            {players.filter(p => p !== currentPlayer).map((player, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.playerSelectButton, { backgroundColor: colors.pink }]}
                                    onPress={() => handlePlayerSelection(player)}
                                >
                                    <Text style={styles.buttonText}>{player}</Text>
                                    <Text style={{ color: 'white', fontSize: 14, opacity: 0.9 }}>
                                        {playerScores[player] || 0} pts
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {renderConfigAndCustomModals()}

            {/* Timer Modal */}
            <TimerModal
                visible={timerVisible}
                timeLeft={timeLeft}
                onClose={() => { setTimerVisible(false); setTimerActive(false); }}
                onStartTimer={startTimer}
                colors={colors}
            />

            {/* Roulette Modal */}
            <RouletteModal
                visible={showRoulette}
                players={players}
                onClose={() => setShowRoulette(false)}
                onWinner={handleRouletteWinner}
                colors={colors}
            />

            <BrickBreaker
                visible={showBrickBreaker}
                currentPlayer={currentPlayer}
                onClose={(success) => {
                    setShowBrickBreaker(false);
                    if (success) {
                        playHaptic('heavy');
                        addPoints(players[currentPlayerIndex], 0); // Safe -> 0
                        nextTurn();
                    } else {
                        handleDrink('¡HAS PERDIDO!\n(3 Tragos)');
                        addPoints(players[currentPlayerIndex], 3); // Lose -> 3 Drinks -> 3 Points
                        // handleDrink opens modal which calls nextTurn on close
                    }
                }}
                colors={colors}
            />

            <FlappyDrink
                visible={showFlappyDrink}
                currentPlayer={currentPlayer}
                onClose={(success) => {
                    setShowFlappyDrink(false);
                    if (success) {
                        addPoints(players[currentPlayerIndex], 0);
                        nextTurn();
                    } else {
                        handleDrink('¡HAS CHOCADO!\n(3 Tragos)');
                        addPoints(players[currentPlayerIndex], 3);
                    }
                }}
                colors={colors}
            />

            <FortuneRoulette
                visible={showFortuneRoulette}
                onClose={handleFortuneResult}
                colors={colors}
            />

            <FastTapper
                visible={showFastTapper}
                currentPlayer={currentPlayer}
                onClose={(success) => {
                    setShowFastTapper(false);
                    if (success) {
                        addPoints(players[currentPlayerIndex], 0);
                        nextTurn();
                    } else {
                        handleDrink('¡MUY LENTO!\n(3 Tragos)');
                        addPoints(players[currentPlayerIndex], 3);
                    }
                }}
                colors={colors}
            />

            <MemoryChallenge
                visible={showMemoryChallenge}
                onClose={(success) => {
                    setShowMemoryChallenge(false);
                    if (success) {
                        addPoints(players[currentPlayerIndex], 0);
                        nextTurn();
                    } else {
                        handleDrink('¡MEMORIA DE PEZ!\n(3 Tragos)');
                        addPoints(players[currentPlayerIndex], 3);
                    }
                }}
                colors={colors}
            />

            <ReflexDuel
                visible={showReflexDuel}
                currentPlayer={currentPlayer}
                onClose={(success) => {
                    setShowReflexDuel(false);
                    if (success) {
                        addPoints(players[currentPlayerIndex], 0);
                        nextTurn();
                    } else {
                        handleDrink('¡BANG! ESTÁS MUERTO.\n(3 Tragos)');
                        addPoints(players[currentPlayerIndex], 3);
                    }
                }}
                colors={colors}
            />

            <StopTheBus
                visible={showStopTheBus}
                onClose={(success) => {
                    setShowStopTheBus(false);
                    if (success) {
                        addPoints(players[currentPlayerIndex], 0);
                        nextTurn();
                    } else {
                        handleDrink('¡TE HAS PASADO!\n(3 Tragos)');
                        addPoints(players[currentPlayerIndex], 3);
                    }
                }}
                colors={colors}
            />

            <GiftBox
                visible={showGiftBox}
                onClose={(success) => {
                    setShowGiftBox(false);
                    if (success) {
                        addPoints(players[currentPlayerIndex], 0); // Gift gives points via handleGift usually? Wait, checking logic.
                        // Standardize: If success=true (no drink), go next.
                        nextTurn();
                    } else {
                        handleDrink('¡BOMBAZO!\n(3 Tragos)');
                        addPoints(players[currentPlayerIndex], 3);
                    }
                }}
                colors={colors}
            />

            <HighLow
                visible={showHighLow}
                onClose={(success) => {
                    setShowHighLow(false);
                    if (success) {
                        addPoints(players[currentPlayerIndex], 0);
                        nextTurn();
                    } else {
                        handleDrink('¡NO ERES ADIVINA!\n(3 Tragos)');
                        addPoints(players[currentPlayerIndex], 3);
                    }
                }}
                colors={colors}
            />

            <HotPotato
                visible={showHotPotato}
                onClose={(success) => {
                    setShowHotPotato(false);
                    // Hot Potato has internal winner or assumed bomb.
                    // If success=true, just next.
                    // If fail, drink logic? 
                    // HotPotato Component onClose(true) implies done.
                    nextTurn();
                }}
                colors={colors}
            />

            <PrecisionSniper
                visible={showPrecisionSniper}
                currentPlayer={currentPlayer}
                onClose={(success) => {
                    setShowPrecisionSniper(false);
                    if (success) {
                        addPoints(players[currentPlayerIndex], 0);
                        nextTurn();
                    } else {
                        handleDrink('¡QUÉ MALA PUNTERÍA!\n(3 Tragos)');
                        addPoints(players[currentPlayerIndex], 3);
                    }
                }}
                colors={colors}
            />

            <WireCut
                visible={showWireCut}
                onClose={(success) => {
                    setShowWireCut(false);
                    if (success) {
                        addPoints(players[currentPlayerIndex], 0);
                        nextTurn();
                    } else {
                        handleDrink('¡BOOM! CABLES CRUZADOS.\n(3 Tragos)');
                        addPoints(players[currentPlayerIndex], 3);
                    }
                }}
                colors={colors}
            />



            <FingerRoulette
                visible={showFingerRoulette}
                onClose={() => {
                    setShowFingerRoulette(false);
                    nextTurn();
                }}
                colors={colors}
            />

            <FingerSoccer
                visible={showFingerSoccer}
                currentPlayer={currentPlayer}
                onClose={(success) => {
                    setShowFingerSoccer(false);
                    nextTurn();
                }}
                colors={colors}
            />




            <TugOfWar visible={showTugOfWar} onClose={() => { setShowTugOfWar(false); nextTurn(); }} colors={colors} />
            <BalanceChallenge visible={showBalanceChallenge} onClose={() => { setShowBalanceChallenge(false); nextTurn(); }} colors={colors} />
            <DrunkPairs visible={showDrunkPairs} onClose={() => { setShowDrunkPairs(false); nextTurn(); }} colors={colors} />
            <ColorMatch
                visible={showColorMatch}
                onClose={(success) => {
                    setShowColorMatch(false);
                    if (!success) {
                        handleDrink('¡TE LIASTE CON LOS COLORES!\n(2 Tragos)');
                        addPoints(players[currentPlayerIndex], 2);
                    }
                    nextTurn();
                }}
                colors={colors}
            />

            <MathSprint
                visible={showMathSprint}
                onClose={(success) => {
                    setShowMathSprint(false);
                    if (!success) {
                        handleDrink('¡SE TE ATRAGANTARON LAS SUMAS!\n(2 Tragos)');
                        addPoints(players[currentPlayerIndex], 2);
                    }
                    nextTurn();
                }}
                colors={colors}
            />

            <HungryHippos
                visible={showHungryHippos}
                allPlayers={players}
                onClose={(results) => {
                    setShowHungryHippos(false);
                    // Add points to winner
                    if (results.winner) {
                        const winnerIndex = players.indexOf(results.winner);
                        if (winnerIndex >= 0) {
                            addPoints(results.winner, 5); // Winner gets 5 points
                        }
                    }
                    // Losers drink?
                    results.losers.forEach(loser => {
                        // Logic to handle multiple losers drinking? 
                        // Just show generic drink message or let logic handle it.
                        // For now we just award points to winner and nextTurn
                    });
                    // Show winner modal or toast? Game shows it internally.
                    nextTurn();
                }}
                colors={colors}
            />
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        paddingTop: 120, // Increased to clear absolute header buttons
    },
    playingContainer: {
        justifyContent: 'flex-start',
        paddingTop: 106,
        paddingBottom: 8,
    },
    playingContainerCompact: {
        paddingTop: 96,
        paddingHorizontal: 16,
        paddingBottom: 6,
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    subheader: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        opacity: 0.8,
    },
    // Setup Styles
    inputContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
        gap: 10,
    },
    input: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
    },
    addButton: {
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
    },
    playerList: {
        width: '100%',
        flex: 1,
        marginBottom: 20,
    },
    playerItem: {
        padding: 20,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    playerText: {
        fontSize: 18,
        fontWeight: '600',
    },
    startButton: {
        width: '100%',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 5,
        marginBottom: 20,
    },
    startButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // Game UI

    turnInfo: {
        alignItems: 'center',
    },
    exitButtonTop: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    turnLabel: {
        fontSize: 16,
        opacity: 0.6,
    },
    turnPlayer: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    turnHeaderContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 22,
    },
    turnHeaderContainerCompact: {
        marginBottom: 12,
    },
    card: {
        width: '100%',
        flex: 1,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 30,
    },
    iconContainer: {
        marginBottom: 20,
    },
    cardText: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 20,
    },
    cardType: {
        fontSize: 14,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 20,
        marginBottom: 8,
    },
    buttonContainerCompact: {
        gap: 12,
        marginBottom: 12,
    },
    button: {
        flex: 1,
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    actionButton: {
        paddingVertical: 16,
    },
    actionButtonCompact: {
        paddingVertical: 14,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resetButton: {
        padding: 10,
    },
    // Modal Styles
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 50,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    drinkModalContent: {
        width: '90%',
        maxWidth: 440,
    },
    drinkText: {
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        width: '100%',
    },
    victimText: {
        fontWeight: 'bold',
        marginBottom: 22,
        width: '100%',
        textAlign: 'center',
    },
    modalButton: {
        marginTop: 24,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    safeArea: {
        flex: 1,
    },
    headerRow: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rankingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#E91E8C', // Pink
        borderRadius: 20,
    },
    // Points System Styles
    iconButton: {
        padding: 12,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)', // Glassmorphism feel
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Removed old scoreButton/scoreText styles
    effectsBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 15,
        width: '100%',
    },
    effectBadge: {
        backgroundColor: '#FF9A56',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    scoreboard: {
        width: '100%',
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        maxHeight: 200,
    },
    scoreboardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    scorePlayerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    scorePoints: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    playerSelectButton: {
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    winnerText: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    winnerSubtext: {
        fontSize: 20,
        marginBottom: 20,
    },
    finalScoreboard: {
        width: '100%',
        padding: 20,
        borderRadius: 15,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    currentScoreBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 15,
        backgroundColor: 'rgba(211, 98, 164, 0.1)',
        borderRadius: 15,
        marginBottom: 15,
        zIndex: 100, // Ensure it stays on top
        elevation: 20, // Android z-index fix
    },
    currentScoreInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    currentScoreLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    currentScoreValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E91E8C',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        paddingBottom: 15,
        borderBottomWidth: 2,
        width: '100%',
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    scoreModalContent: {
        width: '90%',
        maxWidth: 520,
        paddingHorizontal: 22,
        paddingVertical: 30,
    },
    scoreModalHeader: {
        justifyContent: 'flex-start',
    },
    scoreModalTitle: {
        flex: 1,
        flexShrink: 1,
    },
    exitModalContent: {
        width: '90%',
        maxWidth: 500,
        paddingHorizontal: 22,
        paddingVertical: 30,
    },
    exitModalTitle: {
        width: '100%',
        textAlign: 'center',
        flexShrink: 1,
    },
    exitModalDescription: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 24,
        opacity: 0.8,
    },
    exitActionsRow: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    exitActionsRowCompact: {
        gap: 10,
    },
    scoreRowModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginVertical: 4,
    },
    headerIconButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 22,
    },
    infoText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    infoSection: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    configRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        width: '100%',
    },
    configLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
